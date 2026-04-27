"use client";

import { useState } from "react";

export function PayButton({ reservationId, token }: { reservationId: string; token: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pay() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: reservationId, token }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Erreur paiement");
      window.location.href = body.payment_url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={pay}
        disabled={busy}
        className="w-full bg-[var(--color-primary)] text-white py-3 text-sm uppercase tracking-wider disabled:opacity-40 hover:bg-[var(--color-accent)] transition-colors"
      >
        {busy ? "Redirection…" : "Payer maintenant"}
      </button>
      {err && (
        <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">
          {err}
        </div>
      )}
    </div>
  );
}
