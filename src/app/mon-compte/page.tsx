import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase-server";
import { LogoutClient } from "./logout-client";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-xl mx-auto p-10 text-center">
        <h1 className="font-display text-2xl mb-3">Configuration requise</h1>
        <p className="text-sm text-black/60">
          La connexion nécessite Supabase, qui n&apos;est pas encore configuré.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/mon-compte");

  const { data: reservations } = await supabase
    .from("maison_r_reservations")
    .select("*, maison_r_products(name)")
    .eq("customer_email", user.email!)
    .order("created_at", { ascending: false });

  const rows = reservations || [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl md:text-4xl mb-1">Mon compte</h1>
          <p className="text-sm text-black/60">{user.email}</p>
        </div>
        <LogoutClient />
      </div>

      <h2 className="font-display text-xl mb-4">Mes réservations</h2>

      {rows.length === 0 ? (
        <div className="border border-black/10 p-8 text-center text-sm text-black/60">
          Aucune réservation pour l&apos;instant.{" "}
          <Link href="/catalogue/nouveautes" className="text-[var(--color-accent)] hover:underline">
            Parcourir le catalogue →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const productName = Array.isArray(r.maison_r_products)
              ? r.maison_r_products[0]?.name
              : (r.maison_r_products as { name?: string } | null)?.name;
            return (
              <div key={r.id} className="border border-black/10 p-4 flex justify-between items-start gap-4">
                <div>
                  <div className="font-medium">{productName || "—"}</div>
                  <div className="text-sm text-black/70">
                    Du {r.start_date} au {r.end_date} · {r.total_price.toFixed(2)} €
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "En attente", cls: "bg-yellow-100 text-yellow-800" },
    accepted: { label: "Acceptée", cls: "bg-green-100 text-green-800" },
    refused: { label: "Refusée", cls: "bg-red-100 text-red-800" },
    returned: { label: "Retournée", cls: "bg-gray-100 text-gray-700" },
    cancelled: { label: "Annulée", cls: "bg-gray-100 text-gray-500" },
  };
  const s = map[status] || { label: status, cls: "" };
  return <span className={`text-xs px-2 py-0.5 rounded ${s.cls}`}>{s.label}</span>;
}
