import { createClient } from "@/lib/supabase/server";
import { addVehicle, assignDriver } from "./actions";

export default async function VehiclesPage() {
  const supabase = createClient();

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, plate_number, make, model, year, current_odometer, assigned_driver_id")
    .order("plate_number");

  const { data: drivers } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "driver")
    .order("full_name");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-slate-100 mb-1">Vehicles</h1>
        <p className="text-slate-500 text-sm">{vehicles?.length ?? 0} of 25 added</p>
      </div>

      {/* Add vehicle form */}
      <form
        action={addVehicle}
        className="bg-slate-900 border border-slate-800 rounded-lg p-5 grid grid-cols-2 gap-3"
      >
        <input
          name="plate_number"
          required
          placeholder="Plate number"
          className="col-span-2 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500"
        />
        <input
          name="make"
          placeholder="Make (e.g. Toyota)"
          className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500"
        />
        <input
          name="model"
          placeholder="Model (e.g. Hilux)"
          className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500"
        />
        <input
          name="year"
          type="number"
          placeholder="Year"
          className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500"
        />
        <input
          name="current_odometer"
          type="number"
          placeholder="Current odometer (km)"
          className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="col-span-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium py-2 transition-colors"
        >
          Add vehicle
        </button>
      </form>

      {/* Vehicle list */}
      <div className="space-y-3">
        {vehicles?.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-6">
            No vehicles yet — add your first one above.
          </p>
        )}
        {vehicles?.map((v) => (
          <div
            key={v.id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="text-slate-100 font-medium">{v.plate_number}</p>
              <p className="text-slate-500 text-xs">
                {[v.make, v.model, v.year].filter(Boolean).join(" · ") || "No details"} ·{" "}
                {v.current_odometer.toLocaleString()} km
              </p>
            </div>
            <form action={assignDriver} className="flex items-center gap-2">
              <input type="hidden" name="vehicle_id" value={v.id} />
              <select
                name="driver_id"
                defaultValue={v.assigned_driver_id ?? ""}
                className="rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-500"
              >
                <option value="">Unassigned</option>
                {drivers?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="text-xs text-amber-500 hover:text-amber-400 border border-slate-700 rounded-md px-2.5 py-1.5"
              >
                Save
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
