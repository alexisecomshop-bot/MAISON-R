"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const initialErr = searchParams.get("err");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 border border-black/10 p-8 bg-white">
        <h1 className="font-display text-2xl text-center">Administration</h1>

        {initialErr === "unauthorized" && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">
            Compte non autorisé.
          </div>
        )}

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-black/60">Email</span>
          <input
            type="email"
            className="mt-1 w-full border border-black/20 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-black/60">Mot de passe</span>
          <input
            type="password"
            className="mt-1 w-full border border-black/20 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--color-primary)] text-white py-2.5 text-sm uppercase tracking-wider disabled:opacity-40"
        >
          {submitting ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
