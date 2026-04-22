import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase-server";
import { LogoutButton } from "./logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-xl mx-auto p-10 text-center">
        <h1 className="font-display text-2xl mb-3">Configuration requise</h1>
        <p className="text-sm text-black/60">
          Renseigne <code>NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans <code>.env.local</code>,
          puis exécute <code>supabase/maison-r.sql</code> sur ton projet Supabase.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in — render raw children. The /admin/login page shows its form
  // and every other /admin/* page calls requireAdmin() which redirects here.
  if (!user) return <>{children}</>;

  const { data: adminRow } = await supabase
    .from("maison_r_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    return (
      <div className="max-w-xl mx-auto p-10 text-center">
        <h1 className="font-display text-2xl mb-3">Accès refusé</h1>
        <p className="text-sm text-black/60 mb-6">
          Votre compte n&apos;est pas autorisé à accéder à l&apos;administration.
        </p>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-center justify-between mb-8 pb-4 border-b border-black/10 gap-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-display text-xl">Admin</Link>
          <nav className="flex gap-4 text-sm flex-wrap">
            <Link href="/admin" className="hover:text-[var(--color-accent)]">Tableau de bord</Link>
            <Link href="/admin/produits" className="hover:text-[var(--color-accent)]">Produits</Link>
            <Link href="/admin/reservations" className="hover:text-[var(--color-accent)]">Réservations</Link>
            <Link href="/admin/parametres" className="hover:text-[var(--color-accent)]">Paramètres</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-black/60 hidden md:inline">{user.email}</span>
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
