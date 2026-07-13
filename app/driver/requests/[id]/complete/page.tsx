import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { completePurchase } from "./actions";

export default async function CompletePurchasePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: request } = await supabase
    .from("requests")
    .select("id, type, status, estimated_amount, driver_id, vehicles(current_odometer)")
    .eq("id", params.id)
    .single();

  if (!request || request.driver_id !== user!.id) notFound();
  if (request.status !== "approved") redirect("/driver");

  const vehicle = request.vehicles as any;
  const inputClass =
    "w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500";

  return (
    <div className="max-w-md mx-auto px-6 py-8 space-y-5">
      <div>
        <h1 className="font-display text-2xl text-slate-100 mb-1">Complete purchase</h1>
        <p className="text-slate-500 text-sm capitalize">{request.type.replace("_", " ")} request</p>
      </div>

      <form action={completePurchase} className="space-y-4">
        <input type="hidden" name="request_id" value={request.id} />

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Actual vendor</label>
          <input name="actual_vendor" required placeholder="Where did you buy it?" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Actual amount paid</label>
          <input
            name="actual_amount"
            type="number"
            step="0.01"
            required
            defaultValue={request.estimated_amount ?? undefined}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Purchase date</label>
          <input
            name="purchase_date"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Odometer at purchase (km)</label>
          <input
            name="purchase_odometer"
            type="number"
            required
            min={vehicle?.current_odometer ?? 0}
            defaultValue={vehicle?.current_odometer ?? undefined}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Notes (optional)</label>
          <textarea name="purchase_notes" placeholder="Anything else worth noting" className={inputClass + " min-h-20"} />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">
            Receipt photo <span className="text-slate-500">(required)</span>
          </label>
          <input
            type="file"
            name="receipt_photos"
            accept="image/*"
            multiple
            capture="environment"
            required
            className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-300"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium py-3 transition-colors"
        >
          Mark as completed
        </button>
      </form>
    </div>
  );
}
