import { getSettings } from "@/lib/theme";

export default async function ContactPage() {
  const s = await getSettings();

  const fields = [
    { label: "Email", value: s.contact_email, href: s.contact_email ? `mailto:${s.contact_email}` : null },
    { label: "Téléphone", value: s.contact_phone, href: s.contact_phone ? `tel:${s.contact_phone.replace(/\s/g, "")}` : null },
    { label: "Adresse", value: s.contact_address, href: null },
    {
      label: "Instagram",
      value: s.contact_instagram,
      href: s.contact_instagram ? `https://instagram.com/${s.contact_instagram.replace(/^@/, "")}` : null,
    },
    {
      label: "WhatsApp",
      value: s.owner_whatsapp,
      href: s.owner_whatsapp ? `https://wa.me/${s.owner_whatsapp.replace(/[^\d]/g, "")}` : null,
    },
  ].filter((f) => f.value);

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-display text-4xl md:text-5xl mb-4 text-center">Contact</h1>
      <p className="text-center text-black/60 mb-12">
        Une question, une demande particulière ? Contactez-nous directement.
      </p>

      {fields.length === 0 ? (
        <div className="text-center py-16 border border-black/10 text-sm text-black/60">
          Les informations de contact seront affichées ici dès qu&apos;elles
          seront renseignées depuis l&apos;admin.
        </div>
      ) : (
        <div className="border border-black/10 divide-y divide-black/10">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between px-6 py-5">
              <span className="text-xs uppercase tracking-wider text-black/50">
                {f.label}
              </span>
              {f.href ? (
                <a href={f.href} className="text-sm hover:text-[var(--color-accent)]" target={f.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {f.value}
                </a>
              ) : (
                <span className="text-sm">{f.value}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
