"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function ConnexionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/mon-compte";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function oauth(provider: "google") {
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setError(error.message);
  }

  async function emailAuth(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setInfo("");
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else {
        router.push(next);
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) setError(error.message);
      else setInfo("Compte créé. Vérifie ta boîte mail pour confirmer ton adresse.");
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-3xl md:text-4xl text-center mb-2">
        {mode === "signin" ? "Connexion" : "Créer un compte"}
      </h1>
      <p className="text-center text-sm text-black/60 mb-8">
        {mode === "signin"
          ? "Retrouvez votre historique de réservations."
          : "Pour gagner du temps lors de vos prochaines locations."}
      </p>

      <div className="space-y-3">
        <button
          onClick={() => oauth("google")}
          className="w-full flex items-center justify-center gap-3 border border-black/20 py-3 text-sm hover:bg-black/5"
        >
          <GoogleIcon /> Continuer avec Google
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-black/50 uppercase tracking-wider">
        <span className="flex-1 border-t border-black/10" />
        ou
        <span className="flex-1 border-t border-black/10" />
      </div>

      <form onSubmit={emailAuth} className="space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-black/60">Email</span>
          <input
            type="email"
            required
            className="mt-1 w-full border border-black/20 px-3 py-2 bg-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-black/60">Mot de passe</span>
          <input
            type="password"
            required
            minLength={8}
            className="mt-1 w-full border border-black/20 px-3 py-2 bg-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </label>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">
            {error}
          </div>
        )}
        {info && (
          <div className="text-sm text-green-800 bg-green-50 border border-green-200 px-3 py-2">
            {info}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--color-primary)] text-white py-3 text-sm uppercase tracking-wider disabled:opacity-40"
        >
          {submitting ? "…" : mode === "signin" ? "Se connecter" : "Créer le compte"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError("");
          setInfo("");
        }}
        className="mt-6 w-full text-center text-sm text-black/60 hover:text-[var(--color-accent)]"
      >
        {mode === "signin"
          ? "Pas encore de compte ? S'inscrire"
          : "Déjà un compte ? Se connecter"}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
