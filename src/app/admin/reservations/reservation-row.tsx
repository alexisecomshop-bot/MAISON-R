"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export function ReservationRow(props: {
  id: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  total: number;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: "accepted" | "refused" | "cancelled" | "returned") {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("maison_r_reservations").update({ status }).eq("id", props.id);
    router.refresh();
    setBusy(false);
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    refused: "bg-red-100 text-red-800",
    returned: "bg-gray-100 text-gray-700",
    cancelled: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="border border-black/10 p-4 flex flex-wrap gap-4 items-start justify-between">
      <div className="flex-1 min-w-[260px]">
        <div className="text-xs uppercase tracking-wider text-black/50 mb-1">
          {props.productName}
        </div>
        <div className="font-medium">{props.customerName}</div>
        <div className="text-sm text-black/70">
          {props.customerEmail} · {props.customerPhone}
        </div>
        <div className="text-sm mt-1">
          {props.startDate} → {props.endDate} · <strong>{props.total.toFixed(2)} €</strong>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`text-xs px-2 py-0.5 rounded ${statusColors[props.status]}`}>
          {props.status}
        </span>
        {props.status === "pending" && (
          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={() => setStatus("accepted")}
              className="text-xs bg-green-700 text-white px-3 py-1 disabled:opacity-50"
            >
              Accepter
            </button>
            <button
              disabled={busy}
              onClick={() => setStatus("refused")}
              className="text-xs bg-red-700 text-white px-3 py-1 disabled:opacity-50"
            >
              Refuser
            </button>
          </div>
        )}
        {props.status === "accepted" && (
          <button
            disabled={busy}
            onClick={() => setStatus("returned")}
            className="text-xs border border-black/30 px-3 py-1 disabled:opacity-50"
          >
            Marquer retourné
          </button>
        )}
      </div>
    </div>
  );
}
