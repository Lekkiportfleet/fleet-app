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
    .select("id, type, status, estimated_amount, actual_amount, actual_vendor, created_at")
    .eq("vehicle_id", r.vehicle_id)
    .neq("id", r.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const isOpen = r.status === "pending" || r.status === "needs_info";

  return (
    <div className="space-y-6">
      <Link href="/admin/requests" className="text-slate-500 text-sm hover:text-slate-300">
        ← Back to queue
      </Link>

      <div>
        <h1 className="font-display text-2xl text-slate-100">
          {TYPE_LABEL[r.type] ?? r.type} — {r.vehicles?.plate_number}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {r.profiles?.full_name} · submitted {new Date(r.created_at).toLocaleString()}
        </p>
      </div>

      {/* Submitted details */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-2">
        <Row label="Odometer at request" value={`${r.odometer.toLocaleString()} km`} />
        <Row label="Vehicle's current odometer" value={`${r.vehicles?.current_odometer.toLocaleString()} km`} />
        {r.estimated_amount && <Row label="Estimated amount" value={r.estimated_amount.toLocaleString()} />}
        {Object.entries(r.details ?? {}).map(([key, value]) => (
          <Row key={key} label={DETAIL_LABEL[key] ?? key} value={String(value)} />
        ))}
        {r.admin_note && (
          <div className="pt-2 mt-2 border-t border-slate-800">
            <Row label="Admin note" value={r.admin_note} />
          </div>
        )}
      </div>

      {/* Photos */}
      {photoUrls.length > 0 && (
        <div>
          <h2 className="text-slate-300 text-sm font-medium mb-2">Photos</h2>
          <div className="grid grid-cols-3 gap-2">
            {photoUrls.map(
              (url, i) =>
                url && (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt=""
                      className="w-full aspect-square object-cover rounded-md border border-slate-700"
                    />
                  </a>
                )
            )}
          </div>
        </div>
      )}

      {/* Vehicle history */}
      <div>
        <h2 className="text-slate-300 text-sm font-medium mb-2">
          Recent history — {r.vehicles?.plate_number}
        </h2>
        <div className="space-y-2">
          {history?.length === 0 && (
            <p className="text-slate-500 text-sm">No previous transactions for this vehicle.</p>
          )}
          {history?.map((h) => (
            <div
              key={h.id}
              className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex items-center justify-between text-sm"
            >
              <span className="text-slate-300 capitalize">{h.type.replace("_", " ")}</span>
              <span className="text-slate-500">{new Date(h.created_at).toLocaleDateString()}</span>
              <span className="text-slate-400">
                {(h.actual_amount ?? h.estimated_amount)?.toLocaleString() ?? "—"}
              </span>
              <span className="text-slate-500 capitalize">{h.status.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {isOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <h2 className="text-slate-300 text-sm font-medium">Review this request</h2>

          <form action={approveRequest}>
            <input type="hidden" name="request_id" value={r.id} />
            <button
              type="submit"
              className="w-full rounded-md bg-ok hover:opacity-90 text-white font-medium py-2.5 transition-opacity"
            >
              Approve
            </button>
          </form>

          <form action={requestMoreInfo} className="space-y-2">
            <input type="hidden" name="request_id" value={r.id} />
            <textarea
              name="note"
              required
              placeholder="What do you need from the driver?"
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500 min-h-20"
            />
            <button
              type="submit"
              className="w-full rounded-md border border-amber-600 text-amber-400 font-medium py-2.5"
            >
              Request more info
            </button>
          </form>

          <form action={rejectRequest} className="space-y-2">
            <input type="hidden" name="request_id" value={r.id} />
            <textarea
              name="reason"
              required
              placeholder="Reason for rejecting"
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500 min-h-20"
            />
            <button
              type="submit"
              className="w-full rounded-md border border-[#B3432E] text-[#E07856] font-medium py-2.5"
            >
