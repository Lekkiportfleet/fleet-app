import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const TYPE_LABEL: Record<string, string> = {
  fuel: "Fuel",
  tyre: "Tyre",
  maintenance: "Maintenance / Repair",
  service: "Service",
  spare_part: "Spare part",
  other: "Other",
};

export default async function AdminRequestsPage() {
  const supabase = createClient();

  const { data: requests } = await supabase
    .from("requests")
    .select("id, type, status, odometer, estimated_amount, created_at, vehicles(plate_number), profiles(full_name)")
    .in("status", ["pending", "needs_info"])
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-slate-100 mb-1">Pending requests</h1>
        <p className="text-slate-500 text-sm">{requests?.length ?? 0} awaiting review</p>
      </div>

      <div className="space-y-3">
        {requests?.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-10">
            Nothing waiting on you right now.
          </p>
        )}
        {requests?.map((r: any) => (
          <Link
            key={r.id}
            href={`/admin/requests/${r.id}`}
            className="block bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-amber-500 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-100 font-medium">
                  {TYPE_LABEL[r.type] ?? r.type} · {r.vehicles?.plate_number}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {r.profiles?.full_name} · {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-xs border rounded-full px-2.5 py-1 ${
                  r.status === "needs_info"
                    ? "text-amber-400 border-amber-600"
                    : "text-slate-400 border-slate-600"
                }`}
              >
                {r.status === "needs_info" ? "Needs info" : "Pending"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
