"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function run() {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Erreur");
      setMsg(`Sync OK — ${body.synced} produits.`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={run}
        disabled={busy}
        className="bg-[var(--color-primary)] text-white px-4 py-2 text-sm uppercase tracking-wider disabled:opacity-40"
      >
        {busy ? "Sync…" : "Forcer la sync"}
      </button>
      {msg && <span className="text-xs text-green-700">{msg}</span>}
      {err && <span className="text-xs text-red-700">{err}</span>}
    </div>
  );
}
