import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

export function Footer({
  settings,
  isAdmin,
}: {
  settings: SiteSettings;
  isAdmin: boolean;
}) {
  return (
    <footer className="border-t border-black/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10 text-sm">
        <div>
          <div className="font-display text-lg mb-3">{settings.site_name}</div>
          <p className="text-black/60">{settings.hero_subtitle}</p>
        </div>
        <div>
          <div className="uppercase tracking-wider text-xs mb-3">Boutique</div>
          <ul className="space-y-2">
            <li><Link href="/catalogue/vetements">Vêtements</Link></li>
            <li><Link href="/catalogue/chaussures">Chaussures</Link></li>
            <li><Link href="/catalogue/accessoires">Accessoires</Link></li>
            <li><Link href="/catalogue/nouveautes">Nouveautés</Link></li>
          </ul>
        </div>
        <div>
          <div className="uppercase tracking-wider text-xs mb-3">Contact</div>
          <ul className="space-y-2 text-black/70">
            {settings.contact_email && <li>{settings.contact_email}</li>}
            {settings.contact_phone && <li>{settings.contact_phone}</li>}
            {settings.contact_address && <li>{settings.contact_address}</li>}
            {settings.contact_instagram && (
              <li>
                <a
                  href={`https://instagram.com/${settings.contact_instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <div className="uppercase tracking-wider text-xs mb-3">Infos</div>
          <ul className="space-y-2">
            <li><Link href="/contact">Nous contacter</Link></li>
            {isAdmin && (
              <li><Link href="/admin">Admin</Link></li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-black/10">
        <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-black/50 flex justify-between">
          <span>© {new Date().getFullYear()} {settings.site_name}</span>
          <span>Tous droits réservés</span>
        </div>
      </div>
    </footer>
  );
}
