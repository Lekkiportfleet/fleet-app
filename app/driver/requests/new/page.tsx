import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RequestForm from "./request-form";

export default async function NewRequestPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, plate_number, current_odometer")
    .eq("assigned_driver_id", user!.id)
    .maybeSingle();

  if (!vehicle) {
    redirect("/driver");
  }

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h1 className="font-display text-2xl text-slate-100 mb-1">New request</h1>
      <p className="text-slate-500 text-sm mb-6">
        {vehicle.plate_number} · last recorded {vehicle.current_odometer.toLocaleString()} km
      </p>
      <RequestForm vehicleId={vehicle.id} lastOdometer={vehicle.current_odometer} />
    </div>
  );
}
