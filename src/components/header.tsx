"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import type { SiteSettings } from "@/lib/types";

export function Header({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 bg-[var(--color-bg)] border-b border-black/10"
      onMouseLeave={() => setOpen(null)}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          className="md:hidden p-2 -ml-2"
          aria-label="Menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>

        <Link href="/" className="font-display text-xl md:text-2xl tracking-wide">
          {settings.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt={settings.site_name} className="h-8" />
          ) : (
            settings.site_name
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.slug}
              className="h-16 flex items-center"
              onMouseEnter={() => setOpen(cat.slug)}
            >
              <Link
                href={`/catalogue/${cat.slug}`}
                className="text-sm uppercase tracking-wider hover:text-[var(--color-accent)] transition-colors"
              >
                {cat.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-5 text-sm">
          <Link href="/contact" className="hidden md:inline hover:text-[var(--color-accent)]">
            Contact
          </Link>
          <Link href="/admin" aria-label="Admin" className="opacity-60 hover:opacity-100">
            ⚙
          </Link>
        </div>
      </div>

      {/* Mega menu (desktop) */}
      {CATEGORIES.map((cat) => (
        <div
          key={cat.slug}
          className={`mega-menu hidden md:block ${open === cat.slug ? "open" : ""}`}
          onMouseEnter={() => setOpen(cat.slug)}
          onMouseLeave={() => setOpen(null)}
        >
          <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-4 gap-8">
            <div>
              <div className="font-display text-lg mb-4">{cat.label}</div>
              <Link
                href={`/catalogue/${cat.slug}`}
                className="text-sm text-[var(--color-accent)] hover:underline"
              >
                Tout voir →
              </Link>
            </div>
            <div className="col-span-3 grid grid-cols-3 gap-y-3 gap-x-6">
              {cat.subcategories.map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/catalogue/${cat.slug}/${sub.slug}`}
                  className="text-sm hover:text-[var(--color-accent)]"
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-black/10 bg-[var(--color-bg)]">
          <div className="px-6 py-4 space-y-4">
            {CATEGORIES.map((cat) => (
              <details key={cat.slug} className="group">
                <summary className="flex justify-between items-center uppercase tracking-wider text-sm cursor-pointer list-none">
                  {cat.label}
                  <span className="group-open:rotate-180 transition-transform">⌄</span>
                </summary>
                <div className="mt-3 ml-2 flex flex-col gap-2">
                  <Link
                    href={`/catalogue/${cat.slug}`}
                    className="text-sm text-[var(--color-accent)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Tout voir
                  </Link>
                  {cat.subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/catalogue/${cat.slug}/${sub.slug}`}
                      className="text-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <Link
              href="/contact"
              className="block uppercase tracking-wider text-sm pt-2 border-t border-black/10"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
