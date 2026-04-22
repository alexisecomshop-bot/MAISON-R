"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({ existing }: { existing: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(existing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function patch<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadLogo(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("maison-r-photos")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("maison-r-photos").getPublicUrl(path);
      patch("logo_url", pub.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload impossible");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const supabase = createClient();
    const { error: dbErr } = await supabase
      .from("maison_r_site_settings")
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq("id", "default");
    if (dbErr) setError(dbErr.message);
    else setMessage("Paramètres enregistrés.");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-10 max-w-3xl">
      <Section title="Identité">
        <Row label="Nom du site">
          <input
            className="w-full border border-black/20 px-3 py-2"
            value={form.site_name}
            onChange={(e) => patch("site_name", e.target.value)}
          />
        </Row>
        <Row label="Logo">
          <div className="flex items-center gap-4">
            {form.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logo_url} alt="logo" className="h-10 bg-black/5 px-2" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadLogo(e.target.files?.[0] || null)}
              disabled={uploading}
              className="text-sm"
            />
            {form.logo_url && (
              <button
                type="button"
                onClick={() => patch("logo_url", "")}
                className="text-xs text-red-700 hover:underline"
              >
                Retirer
              </button>
            )}
          </div>
        </Row>
        <Row label="Titre hero">
          <input
            className="w-full border border-black/20 px-3 py-2"
            value={form.hero_title}
            onChange={(e) => patch("hero_title", e.target.value)}
          />
        </Row>
        <Row label="Sous-titre hero">
          <input
            className="w-full border border-black/20 px-3 py-2"
            value={form.hero_subtitle}
            onChange={(e) => patch("hero_subtitle", e.target.value)}
          />
        </Row>
      </Section>

      <Section title="Couleurs">
        <div className="grid grid-cols-2 gap-4">
          <Color label="Principale" value={form.primary_color} onChange={(v) => patch("primary_color", v)} />
          <Color label="Accent" value={form.accent_color} onChange={(v) => patch("accent_color", v)} />
          <Color label="Fond" value={form.background_color} onChange={(v) => patch("background_color", v)} />
          <Color label="Texte" value={form.text_color} onChange={(v) => patch("text_color", v)} />
        </div>
      </Section>

      <Section title="Notifications WhatsApp">
        <Row label="Numéro WhatsApp du propriétaire (format +33...)">
          <input
            className="w-full border border-black/20 px-3 py-2"
            value={form.owner_whatsapp}
            onChange={(e) => patch("owner_whatsapp", e.target.value)}
            placeholder="+33612345678"
          />
        </Row>
        <p className="text-xs text-black/60">
          C&apos;est à ce numéro que chaque demande de location sera envoyée,
          avec deux liens (Accepter / Refuser).
        </p>
      </Section>

      <Section title="Coordonnées publiques (page Contact)">
        <Row label="Email">
          <input
            className="w-full border border-black/20 px-3 py-2"
            value={form.contact_email}
            onChange={(e) => patch("contact_email", e.target.value)}
          />
        </Row>
        <Row label="Téléphone">
          <input
            className="w-full border border-black/20 px-3 py-2"
            value={form.contact_phone}
            onChange={(e) => patch("contact_phone", e.target.value)}
          />
        </Row>
        <Row label="Adresse">
          <input
            className="w-full border border-black/20 px-3 py-2"
            value={form.contact_address}
            onChange={(e) => patch("contact_address", e.target.value)}
          />
        </Row>
        <Row label="Instagram (sans @)">
          <input
            className="w-full border border-black/20 px-3 py-2"
            value={form.contact_instagram}
            onChange={(e) => patch("contact_instagram", e.target.value)}
          />
        </Row>
      </Section>

      {message && (
        <div className="text-sm text-green-800 bg-green-50 border border-green-200 px-3 py-2">
          {message}
        </div>
      )}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-[var(--color-primary)] text-white px-6 py-2.5 text-sm uppercase tracking-wider disabled:opacity-40"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-black/60">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-black/60">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border border-black/20 p-0"
        />
        <input
          className="flex-1 border border-black/20 px-3 py-2 font-mono text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}
