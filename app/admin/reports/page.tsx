import { createClient } from "@/lib/supabase/server";
import ReportView from "./report-view";

const TYPE_LABEL: Record<string, string> = {
  fuel: "Fuel",
  tyre: "Tyre",
  maintenance: "Maintenance / Repair",
  service: "Service",
  spare_part: "Spare part",
  other: "Other",
};

type DriverStat = { name: string; spend: number; requestCount: number; approved: number; rejected: number };
type VehicleStat = { plate: string; total: number; byType: Record<string, number> };

export default async function ReportsPage() {
  const supabase = createClient();

  const { data: requests } = await supabase
    .from("requests")
    .select(
      "id, type, status, actual_amount, estimated_amount, odometer, created_at, updated_at, vehicles(plate_number), profiles(full_name)"
    )
    .order("created_at", { ascending: false });

  const rows = (requests ?? []) as any[];
  const completed = rows.filter((r) => r.status === "completed");

  const vehicleMap = new Map<string, VehicleStat>();
  for (const r of completed) {
    const plate = r.vehicles?.plate_number ?? "Unknown";
    if (!vehicleMap.has(plate)) vehicleMap.set(plate, { plate: plate, total: 0, byType: {} });
    const v = vehicleMap.get(plate)!;
    const amount = r.actual_amount ?? 0;
    v.total += amount;
    v.byType[r.type] = (v.byType[r.type] ?? 0) + amount;
  }
  const vehicleWise = Array.from(vehicleMap.values()).sort((a, b) => b.total - a.total);

  const categoryMap = new Map<string, number>();
  for (const r of completed) {
    categoryMap.set(r.type, (categoryMap.get(r.type) ?? 0) + (r.actual_amount ?? 0));
  }
  const expenseWise = Array.from(categoryMap.entries())
    .map(([type, total]) => ({ type: type, label: TYPE_LABEL[type] ?? type, total: total }))
    .sort((a, b) => b.total - a.total);

  const currentYear = new Date().getFullYear();
  const monthMap = new Map<string, number>();
  for (const r of completed) {
    const d = new Date(r.updated_at ?? r.created_at);
    if (d.getFullYear() !== currentYear) continue;
    const key = d.toLocaleString("en-US", { month: "short" });
    monthMap.set(key, (monthMap.get(key) ?? 0) + (r.actual_amount ?? 0));
  }
  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthly = monthOrder
    .filter((m) => monthMap.has(m))
    .map((m) => ({ month: m, total: monthMap.get(m)! }));
  const ytdTotal = monthly.reduce((sum, m) => sum + m.total, 0);

  const driverMap = new Map<string, DriverStat>();
  for (const r of rows) {
    const name = r.profiles?.full_name ?? "Unknown";
    if (!driverMap.has(name)) {
      driverMap.set(name, { name: name, spend: 0, requestCount: 0, approved: 0, rejected: 0 });
    }
    const d = driverMap.get(name)!;
    d.requestCount += 1;
    if (r.status === "completed") d.spend += r.actual_amount ?? 0;
    if (r.status === "approved" || r.status === "completed") d.approved += 1;
    if (r.status === "rejected") d.rejected += 1;
  }
  const driverWise = Array.from(driverMap.values()).sort((a, b) => b.spend - a.spend);

  const exportRows = completed.map((r) => ({
    date: new Date(r.updated_at ?? r.created_at).toLocaleDateString(),
    vehicle: r.vehicles?.plate_number ?? "",
    driver: r.profiles?.full_name ?? "",
    type: TYPE_LABEL[r.type] ?? r.type,
    amount: r.actual_amount ?? 0,
  }));

  // Full history — every request, any status, for the new browsable table
  const allHistory = rows.map((r) => ({
    id: r.id as string,
    date: new Date(r.created_at).toLocaleDateString(),
    vehicle: r.vehicles?.plate_number ?? "",
    driver: r.profiles?.full_name ?? "",
    type: TYPE_LABEL[r.type] ?? r.type,
    status: r.status as string,
    odometer: r.odometer as number,
    amount: (r.actual_amount ?? r.estimated_amount ?? 0) as number,
  }));

  return (
    <ReportView
      vehicleWise={vehicleWise}
      expenseWise={expenseWise}
      monthly={monthly}
      ytdTotal={ytdTotal}
      driverWise={driverWise}
      exportRows={exportRows}
      typeLabels={TYPE_LABEL}
      allHistory={allHistory}
    />
  );
}
