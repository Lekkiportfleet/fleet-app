"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Only admins can do this");
  return supabase;
}

export async function addVehicle(formData: FormData) {
  const supabase = await requireAdmin();

  const plate_number = formData.get("plate_number") as string;
  const make = formData.get("make") as string;
  const model = formData.get("model") as string;
  const yearRaw = formData.get("year") as string;
  const odometerRaw = formData.get("current_odometer") as string;

  const { error } = await supabase.from("vehicles").insert({
    plate_number,
    make: make || null,
    model: model || null,
    year: yearRaw ? Number(yearRaw) : null,
    current_odometer: odometerRaw ? Number(odometerRaw) : 0,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/vehicles");
}

export async function assignDriver(formData: FormData) {
  const supabase = await requireAdmin();

  const vehicleId = formData.get("vehicle_id") as string;
  const driverId = formData.get("driver_id") as string;

  const { error } = await supabase
    .from("vehicles")
    .update({ assigned_driver_id: driverId || null })
    .eq("id", vehicleId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/vehicles");
}
