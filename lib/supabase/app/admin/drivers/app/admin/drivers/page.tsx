import { createClient } from "@/lib/supabase/server";
import { addDriver } from "./actions";

export default async function DriversPage() {
  const supabase = createClient();

  const { data: drivers } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "driver")
    .order("full_name");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-slate-100 mb-1">Drivers</h1>
        <p className="text-slate-500 text-sm">{drivers?.length ?? 0} driver accounts</p>
      </div>

      {/* Add driver form */}
      <form
        action={addDriver}
        className="bg-slate-900 border border-slate-800 rounded-lg p-5 grid gap-3"
      >
        <input
          name="full_name"
          required
          placeholder="Driver's full name"
          className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500"
        />
        <input
          name="password"
          type="text"
          required
          minLength={6}
          placeholder="Temporary password (at least 6 characters)"
          className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500"
        />
        <p className="text-xs text-slate-500 -mt-1">
          Share this password with the driver directly — they can use it to log in right away.
        </p>
        <button
          type="submit"
          className="rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium py-2 transition-colors"
        >
          Create driver login
        </button>
      </form>

      {/* Driver list */}
      <div className="space-y-3">
        {drivers?.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-6">
            No drivers yet — add your first one above.
          </p>
        )}
        {drivers?.map((d) => (
          <div
            key={d.id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4"
          >
            <p className="text-slate-100 font-medium">{d.full_name}</p>
            <p className="text-slate-500 text-xs">{d.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
