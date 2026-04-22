import { requireAdmin } from "../require-admin";
import { SettingsForm } from "./settings-form";
import { DEFAULT_SETTINGS } from "@/lib/theme";
import type { SiteSettings } from "@/lib/types";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("maison_r_site_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  const settings = { ...DEFAULT_SETTINGS, ...(data as Partial<SiteSettings> | null) };

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Paramètres du site</h1>
      <p className="text-sm text-black/60 mb-8 max-w-2xl">
        Personnalise le site : couleurs, logo, coordonnées de contact, numéro
        WhatsApp de réception des demandes. Ces changements sont visibles
        immédiatement sur le site public.
      </p>
      <SettingsForm existing={settings as SiteSettings} />
    </div>
  );
}
