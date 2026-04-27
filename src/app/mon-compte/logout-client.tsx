"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export function LogoutClient() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
      className="text-xs uppercase tracking-wider border border-black/20 px-3 py-1.5 hover:bg-black/5"
    >
      Déconnexion
    </button>
  );
}
