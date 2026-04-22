"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { CATEGORIES } from "@/lib/categories";
import type { Product } from "@/lib/types";

export function ProductForm({ existing }: { existing?: Product }) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: existing?.name || "",
    description: existing?.description || "",
    brand: existing?.brand || "",
    category: existing?.category || "vetements",
    subcategory: existing?.subcategory || "",
    size: existing?.size || "",
    color: existing?.color || "",
    daily_price: existing?.daily_price?.toString() || "",
    deposit: existing?.deposit?.toString() || "",
    available: existing?.available ?? true,
  });
  const [images, setImages] = useState<string[]>(existing?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const subcategories =
    CATEGORIES.find((c) => c.slug === form.category)?.subcategories || [];

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("maison-r-photos")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage
          .from("maison-r-photos")
          .getPublicUrl(path);
        uploaded.push(pub.publicUrl);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload impossible");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: form.name,
      description: form.description,
      brand: form.brand,
      category: form.category,
      subcategory: form.subcategory,
      size: form.size,
      color: form.color,
      daily_price: Number(form.daily_price),
      deposit: Number(form.deposit || 0),
      available: form.available,
      images,
    };
    const q = existing
      ? supabase.from("maison_r_products").update(payload).eq("id", existing.id)
      : supabase.from("maison_r_products").insert(payload);
    const { error: dbErr } = await q;
    if (dbErr) {
      setError(dbErr.message);
      setSaving(false);
      return;
    }
    router.push("/admin/produits");
    router.refresh();
  }

  async function remove() {
    if (!existing) return;
    if (!confirm("Supprimer ce produit ?")) return;
    await supabase.from("maison_r_products").delete().eq("id", existing.id);
    router.push("/admin/produits");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-6 max-w-2xl">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Nom">
          <input
            required
            className="w-full border border-black/20 px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Marque">
          <input
            className="w-full border border-black/20 px-3 py-2"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />
        </Field>
        <Field label="Catégorie">
          <select
            className="w-full border border-black/20 px-3 py-2 bg-white"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Sous-catégorie">
          <select
            className="w-full border border-black/20 px-3 py-2 bg-white"
            value={form.subcategory}
            onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
          >
            <option value="">—</option>
            {subcategories.map((s) => (
              <option key={s.slug} value={s.slug}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Taille">
          <input
            className="w-full border border-black/20 px-3 py-2"
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
          />
        </Field>
        <Field label="Couleur">
          <input
            className="w-full border border-black/20 px-3 py-2"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />
        </Field>
        <Field label="Prix / jour (€)">
          <input
            required
            type="number"
            step="0.01"
            className="w-full border border-black/20 px-3 py-2"
            value={form.daily_price}
            onChange={(e) => setForm({ ...form, daily_price: e.target.value })}
          />
        </Field>
        <Field label="Caution (€)">
          <input
            type="number"
            step="0.01"
            className="w-full border border-black/20 px-3 py-2"
            value={form.deposit}
            onChange={(e) => setForm({ ...form, deposit: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          rows={4}
          className="w-full border border-black/20 px-3 py-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </Field>

      <div>
        <div className="text-xs uppercase tracking-wider text-black/60 mb-2">Photos</div>
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-3">
            {images.map((url, i) => (
              <div key={i} className="relative aspect-square bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-white/90 text-xs px-2 py-0.5"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => upload(e.target.files)}
          disabled={uploading}
          className="text-sm"
        />
        {uploading && <span className="text-xs text-black/60 ml-3">Envoi en cours…</span>}
        <p className="text-xs text-black/50 mt-2">
          Bucket Supabase <code>maison-r-photos</code> requis (public).
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.available}
          onChange={(e) => setForm({ ...form, available: e.target.checked })}
        />
        Disponible à la location
      </label>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-[var(--color-primary)] text-white px-6 py-2.5 text-sm uppercase tracking-wider disabled:opacity-40"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={remove}
            className="text-red-700 hover:underline text-sm"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-black/60">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
