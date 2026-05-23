"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { createClient } from "@/lib/supabase-browser";
import type { SiteSettings } from "@/lib/types";

export function Header({
  settings,
  isAdmin,
}: {
  settings: SiteSettings;
  isAdmin: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    let cancelled = false;
    try {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data }) => {
        if (!cancelled) setAuthed(!!data.session);
      });
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!cancelled) setAuthed(!!session);
      });
      return () => {
        cancelled = true;
        subscription.unsubscribe();
      };
    } catch {
      // Supabase not configured — leave authed as null, show generic link.
      setAuthed(false);
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)] border-b border-black/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          className="p-2 -ml-2"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <span className="block w-5 h-5 relative">
              <span className="absolute top-1/2 left-0 w-5 h-0.5 bg-current rotate-45" />
              <span className="absolute top-1/2 left-0 w-5 h-0.5 bg-current -rotate-45" />
            </span>
          ) : (
            <span className="block w-5">
              <span className="block w-5 h-0.5 bg-current mb-1" />
              <span className="block w-5 h-0.5 bg-current mb-1" />
              <span className="block w-5 h-0.5 bg-current" />
            </span>
          )}
        </button>

        <Link
          href="/"
          className="font-display text-xl md:text-2xl tracking-wide"
          onClick={() => setMenuOpen(false)}
        >
          {logoFailed ? (
            settings.site_name
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo_url || "/logo.png"}
              alt={settings.site_name}
              className="h-8"
              onError={() => setLogoFailed(true)}
            />
          )}
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link
            href={authed ? "/mon-compte" : "/connexion"}
            aria-label={authed ? "Mon compte" : "Se connecter"}
            className="hover:text-[var(--color-accent)]"
          >
            <UserIcon />
          </Link>
          {isAdmin && (
            <Link href="/admin" aria-label="Admin" className="opacity-60 hover:opacity-100">
              ⚙
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-black/30 z-30"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="absolute top-full left-0 right-0 bg-[var(--color-bg)] border-b border-black/10 shadow-lg z-40 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-6 space-y-3">
              {CATEGORIES.map((cat) => (
                <details key={cat.slug} className="group border-b border-black/10 pb-3">
                  <summary className="flex justify-between items-center uppercase tracking-wider text-sm cursor-pointer list-none py-2">
                    {cat.label}
                    {cat.subcategories.length > 0 && (
                      <span className="group-open:rotate-180 transition-transform text-lg">⌄</span>
                    )}
                  </summary>
                  <div className="mt-2 ml-2 flex flex-col gap-2 pb-2">
                    <Link
                      href={`/catalogue/${cat.slug}`}
                      className="text-sm text-[var(--color-accent)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Tout voir →
                    </Link>
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/catalogue/${cat.slug}/${sub.slug}`}
                        className="text-sm hover:text-[var(--color-accent)]"
                        onClick={() => setMenuOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
              <Link
                href="/contact"
                className="block uppercase tracking-wider text-sm pt-2"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href={authed ? "/mon-compte" : "/connexion"}
                className="block uppercase tracking-wider text-sm"
                onClick={() => setMenuOpen(false)}
              >
                {authed ? "Mon compte" : "Connexion"}
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20c1.5-3.5 4.5-5.5 8-5.5s6.5 2 8 5.5" strokeLinecap="round" />
    </svg>
  );
}
