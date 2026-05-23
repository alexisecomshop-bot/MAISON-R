import { createClient, isSupabaseConfigured } from "./supabase-server";

// Returns true if the currently authenticated user is in maison_r_admins.
// Used by the root layout to conditionally render admin links in Header/Footer
// so the gear icon is hidden from non-admins.
export async function checkIsAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("maison_r_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}
