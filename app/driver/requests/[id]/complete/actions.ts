"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completePurchase(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const requestId = formData.get("request_id") as string;
  const actualVendor = formData.get("actual_vendor") as string;
  const actualAmount = Number(formData.get("actual_amount"));
  const purchaseDate = formData.get("purchase_date") as string;
  const purchaseOdometer = Number(formData.get("purchase_odometer"));
  const purchaseNotes = formData.get("purchase_notes") as string;

  // Confirm this request actually belongs to this driver and is approved,
  // so the update below can't be pointed at someone else's request.
  const { data: existing } = await supabase
    .from("requests")
    .select("id, driver_id, status, vehicle_id")
    .eq("id", requestId)
    .single();

  if (!existing || existing.driver_id !== user.id) {
    throw new Error("Request not found");
  }
  if (existing.status !== "approved") {
    throw new Error("This request isn't approved yet");
  }

  const photos = formData.getAll("receipt_photos") as File[];
  const hasPhoto = photos.some((p) => p instanceof File && p.size > 0);
  if (!hasPhoto) {
    throw new Error("At least one receipt photo is required");
  }

  const { error } = await supabase
    .from("requests")
    .update({
      status: "completed",
      actual_vendor: actualVendor,
      actual_amount: actualAmount,
      purchase_date: purchaseDate,
      odometer: purchaseOdometer,
      purchase_notes: purchaseNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) throw new Error(error.message);

  // Keep the vehicle's recorded odometer current
  await supabase
    .from("vehicles")
    .update({ current_odometer: purchaseOdometer })
    .eq("id", existing.vehicle_id)
    .lt("current_odometer", purchaseOdometer);

  for (const photo of photos) {
    if (!(photo instanceof File) || photo.size === 0) continue;
    const path = `${user.id}/${requestId}/receipt-${Date.now()}-${photo.name}`;
    const { error: uploadError } = await supabase.storage
      .from("request-photos")
      .upload(path, photo);
    if (uploadError) throw new Error(uploadError.message);

    await supabase.from("request_photos").insert({
      request_id: requestId,
      storage_path: path,
      kind: "receipt",
    });
  }

  revalidatePath("/driver");
  redirect("/driver");
}
