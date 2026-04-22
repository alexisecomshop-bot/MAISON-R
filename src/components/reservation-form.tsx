"use client";

import { useMemo, useState } from "react";
import { DateRangePicker } from "./date-range-picker";
import type { Product } from "@/lib/types";

type BlockedRange = { start: string; end: string };

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

export function ReservationForm({
  product,
  blocked,
}: {
  product: Product;
  blocked: BlockedRange[];
}) {
  const [range, setRange] = useState<{ start: string | null; end: string | null }>(
    { start: null, end: null },
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"ok" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const nbDays = useMemo(
    () => (range.start && range.end ? daysBetween(range.start, range.end) : 0),
    [range],
  );
  const total = nbDays * product.daily_price;
  const ready = !!(range.start && range.end && name && email && phone);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setResult(null);
    setErrorMsg("");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          start_date: range.start,
          end_date: range.end,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erreur serveur");
      }
      setResult("ok");
      setRange({ start: null, end: null });
      setName("");
      setEmail("");
      setPhone("");
    } catch (err) {
      setResult("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  if (result === "ok") {
    return (
      <div className="border border-[var(--color-accent)] p-6 text-sm">
        <div className="font-display text-lg mb-2">Demande envoyée</div>
        <p className="text-black/70">
          Nous avons transmis votre demande à l&apos;équipe. Vous recevrez un
          email dès qu&apos;elle sera acceptée.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-wider mb-3">Dates de location</div>
        <DateRangePicker blocked={blocked} value={range} onChange={setRange} />
      </div>

      {range.start && range.end && (
        <div className="border border-black/10 p-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Du {range.start} au {range.end}</span>
            <span>{nbDays} j</span>
          </div>
          <div className="flex justify-between">
            <span>{product.daily_price} € × {nbDays} j</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-black/60">
            <span>Caution (bloquée)</span>
            <span>{product.deposit.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between font-medium pt-2 border-t border-black/10 mt-2">
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-black/60">Nom complet</span>
          <input
            className="mt-1 w-full border border-black/20 px-3 py-2 bg-transparent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-black/60">Téléphone (WhatsApp)</span>
          <input
            type="tel"
            className="mt-1 w-full border border-black/20 px-3 py-2 bg-transparent"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33 6 12 34 56 78"
            required
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs uppercase tracking-wider text-black/60">Email</span>
          <input
            type="email"
            className="mt-1 w-full border border-black/20 px-3 py-2 bg-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>

      {result === "error" && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2">
          {errorMsg || "Une erreur est survenue."}
        </div>
      )}

      <button
        type="submit"
        disabled={!ready || submitting}
        className="w-full bg-[var(--color-primary)] text-white py-3 text-sm uppercase tracking-wider disabled:opacity-40 hover:bg-[var(--color-accent)] transition-colors"
      >
        {submitting ? "Envoi…" : "Envoyer la demande de location"}
      </button>
      <p className="text-xs text-black/50">
        La demande est transmise par WhatsApp au propriétaire. Vous serez
        informé dès qu&apos;elle est acceptée ou refusée.
      </p>
    </form>
  );
}
