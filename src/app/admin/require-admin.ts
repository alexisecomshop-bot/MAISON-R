import { notFound, redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase-server";

export async function requireAdmin() {
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: adminRow } = await supabase
    .from("maison_r_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRow) redirect("/admin/login?err=unauthorized");

  return { user, supabase };
}
