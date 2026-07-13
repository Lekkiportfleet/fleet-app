import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  needs_info: "Needs info",
  approved: "Approved",
  rejected: "Rejected",
  procurement_in_progress: "Procurement in progress",
  completed: "Completed",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "text-slate-400 border-slate-600",
  needs_info: "text-amber-400 border-amber-600",
  approved: "text-ok border-[#2E7D5B]",
  rejected: "text-danger border-[#B3432E]",
  procurement_in_progress: "text-amber-400 border-amber-600",
  completed: "text-ok border-[#2E7D5B]",
};

export default async function DriverHome() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, plate_number, make, model, current_odometer")
    .eq("assigned_driver_id", user!.id)
    .maybeSingle();

  const { data: requests } = await supabase
    .from("requests")
    .select("id, type, status, odometer, estimated_amount, created_at")
    .eq("driver_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-md mx-auto px-6 py-8 space-y-6">
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-wide">Driver</p>
        <h1 className="font-display text-2xl text-slate-100">
          {profile?.full_name ?? user?.email}
        </h1>
      </div>

      {vehicle ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="text-slate-100 font-medium">{vehicle.plate_number}</p>
          <p className="text-slate-500 text-xs">
            {[vehicle.make, vehicle.model].filter(Boolean).join(" · ") || "No details"} ·{" "}
            {vehicle.current_odometer.toLocaleString()} km
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="text-slate-400 text-sm">
            No vehicle assigned to you yet. Contact your fleet admin.
          </p>
        </div>
      )}

      {vehicle && (
        <Link
          href="/driver/requests/new"
          className="block text-center rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium py-3 transition-colors"
        >
          New request
        </Link>
      )}

      <div className="space-y-3">
        <h2 className="text-slate-300 text-sm font-medium">Your requests</h2>
        {requests?.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-6">
            No requests yet.
          </p>
        )}
        {requests?.map((r) => (
          <div
            key={r.id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-slate-100 font-medium capitalize">
                {r.type.replace("_", " ")}
              </p>
              <p className="text-slate-500 text-xs">
                {new Date(r.created_at).toLocaleDateString()} · {r.odometer.toLocaleString()} km
              </p>
            </div>
            <span
              className={`text-xs border rounded-full px-2.5 py-1 ${STATUS_COLOR[r.status]}`}
            >
              {STATUS_LABEL[r.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
