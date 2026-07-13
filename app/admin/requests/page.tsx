import { createClient } from "@/lib/supabase/server";
import RequestsView from "./requests-view";

export default async function AdminRequestsPage() {
  const supabase = createClient();

  const { data: requests } = await supabase
    .from("requests")
    .select(
      "id, type, status, odometer, estimated_amount, created_at, vehicles(plate_number), profiles(full_name)"
    )
    .order("created_at", { ascending: false });

  const rows = (requests ?? []).map((r: any) => ({
    id: r.id,
    type: r.type,
    status: r.status,
    odometer: r.odometer,
    estimatedAmount: r.estimated_amount,
    createdAt: r.created_at,
    plate: r.vehicles?.plate_number ?? "",
    driver: r.profiles?.full_name ?? "",
  }));

  return <RequestsView requests={rows} />;
}
