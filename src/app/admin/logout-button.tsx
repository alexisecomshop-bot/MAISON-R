"use client";

import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="text-xs uppercase tracking-wider border border-black/20 px-3 py-1.5 hover:bg-black/5"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Déconnexion
    </button>
  );
}
