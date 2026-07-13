import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHome() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();

  const { count: vehicleCount } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true });

  const { count: driverCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "driver");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-amber-500 text-xs uppercase tracking-wide">Admin</p>
        <h1 className="font-display text-2xl text-slate-100">
          {profile?.full_name ?? user?.email}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/admin/vehicles"
          className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-amber-500 transition-colors"
        >
          <p className="text-3xl font-display text-slate-100">{vehicleCount ?? 0}</p>
          <p className="text-slate-500 text-sm mt-1">Vehicles →</p>
        </Link>
        <Link
          href="/admin/drivers"
          className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-amber-500 transition-colors"
        >
          <p className="text-3xl font-display text-slate-100">{driverCount ?? 0}</p>
          <p className="text-slate-500 text-sm mt-1">Drivers →</p>
        </Link>
      </div>
    </div>
  );
}
