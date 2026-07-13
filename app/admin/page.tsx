import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/app/sign-out-button";

export default async function AdminHome() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-amber-500 text-xs uppercase tracking-wide">Admin</p>
            <h1 className="font-display text-2xl text-slate-100">
              {profile?.full_name ?? user?.email}
            </h1>
          </div>
          <SignOutButton />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
          <p className="text-slate-400 text-sm">
            You're signed in as an admin. Vehicle &amp; driver management,
            the review queue, and reports will live here in the next build
            steps.
          </p>
        </div>
      </div>
    </main>
  );
}
