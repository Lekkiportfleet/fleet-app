import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { approveRequest, rejectRequest, requestMoreInfo } from "../actions";

const TYPE_LABEL: Record<string, string> = {
  fuel: "Fuel",
  tyre: "Tyre",
  maintenance: "Maintenance / Repair",
  service: "Service",
  spare_part: "Spare part",
  other: "Other",
};

const DETAIL_LABEL: Record<string, string> = {
  litres: "Litres",
  vendor: "Vendor",
  position: "Tyre position",
  reason: "Reason",
  preferred_vendor: "Preferred vendor",
  issue_description: "Issue",
  urgency: "Urgency",
  service_type: "Service type",
  part_name: "Part name",
  description: "Description",
};

export default async function AdminRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: request } = await supabase
    .from("requests")
    .select(
      "id, type, status, odometer, estimated_amount, details, admin_note, created_at, vehicle_id, driver_id, vehicles(plate_number, current_odometer), profiles(full_name)"
    )
    .eq("id", params.id)
    .single();

  if (!request) notFound();
  const r = request as any;

  const { data: photoRows } = await supabase
    .from("request_photos")
    .select("id, storage_path")
    .eq("request_id", r.id);

  const photoUrls = await Promise.all(
    (photoRows ?? []).map(async (p) => {
      const { data } = await supabase.storage
        .from("request-photos")
        .createSignedUrl(p.storage_path, 60 * 60);
      return data?.signedUrl;
    })
  );

  const { data: history } = await supabase
    .from("requests")
    .select("id, type, status, estimated_amount, actual_amount, actual_vendor, odometer, created_at")
    .eq("vehicle_id", r.vehicle_id)
    .eq("type", r.type)
    .neq("id", r.id)
    .order("created_at", { ascending: false })
    .limit(5);

  let fuelContext: {
    lastOdometer: number;
    lastDate: string;
    kmSince: number;
    litres: number | null;
    kmPerLitre: number | null;
  } | null = null;

  if (r.type === "fuel") {
    const { data: lastFuel } = await supabase
      .from("requests")
      .select("odometer, updated_at, created_at")
      .eq("vehicle_id", r.vehicle_id)
      .eq("type", "fuel")
      .eq("status", "completed")
      .neq("id", r.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastFuel) {
      const kmSince = r.odometer - lastFuel.odometer;
      const litresRaw = r.details?.litres;
      const litres = litresRaw ? Number(litresRaw) : null;
      fuelContext = {
        lastOdometer: lastFuel.odometer,
        lastDate: lastFuel.updated_at ?? lastFuel.created_at,
        kmSince,
        litres,
        kmPerLitre: litres && litres > 0 ? kmSince / litres : null,
      };
    }
  }

  const isOpen = r.status === "pending" || r.status === "needs_info";
