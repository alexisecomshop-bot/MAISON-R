import { createClient } from "./supabase-server";
import type { SiteSettings } from "./types";

export const DEFAULT_SETTINGS: SiteSettings = {
  id: "default",
  site_name: "Maison R",
  logo_url: "",
  primary_color: "#111111",
  accent_color: "#b8935a",
  background_color: "#f7f5f1",
  text_color: "#111111",
  owner_whatsapp: "",
  contact_email: "",
  contact_phone: "",
  contact_address: "",
  contact_instagram: "",
  hero_title: "Location de pièces d'exception",
  hero_subtitle: "Offrez-vous le luxe, le temps d'une occasion.",
  updated_at: new Date().toISOString(),
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("maison_r_site_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...data };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function settingsToCssVars(s: SiteSettings): Record<string, string> {
  return {
    "--color-primary": s.primary_color,
    "--color-accent": s.accent_color,
    "--color-bg": s.background_color,
    "--color-text": s.text_color,
  };
}
