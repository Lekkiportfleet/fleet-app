"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createRequest(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const vehicleId = formData.get("vehicle_id") as string;
  const type = formData.get("type") as string;
  const odometer = Number(formData.get("odometer"));
  const estimatedAmountRaw = formData.get("estimated_amount") as string;
  const detailsRaw = formData.get("details") as string;

  const { data: request, error } = await supabase
    .from("requests")
    .insert({
      vehicle_id: vehicleId,
      driver_id: user.id,
      type,
      odometer,
      estimated_amount: estimatedAmountRaw ? Number(estimatedAmountRaw) : null,
      details: detailsRaw ? JSON.parse(detailsRaw) : {},
    })
    .select("id")
    .single();

  if (error || !request) {
    throw new Error(error?.message ?? "Could not create request");
  }

  const photos = formData.getAll("photos") as File[];
  for (const photo of photos) {
    if (!(photo instanceof File) || photo.size === 0) continue;
    const path = `${user.id}/${request.id}/${Date.now()}-${photo.name}`;
    const { error: uploadError } = await supabase.storage
      .from("request-photos")
      .upload(path, photo);
    if (uploadError) throw new Error(uploadError.message);

    await supabase.from("request_photos").insert({
      request_id: request.id,
      storage_path: path,
      kind: "submission",
    });
  }

  revalidatePath("/driver");
  redirect("/driver");
}
