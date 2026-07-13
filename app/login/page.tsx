"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      setError("Email or password didn't match. Try again.");
      return;
    }

    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-block h-1 w-10 bg-amber-500 rounded-full mb-4" />
          <h1 className="font-display text-3xl tracking-tight text-slate-100">
            Fleet Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm text-slate-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 outline-none"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-slate-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-[#E07856] bg-[#B3432E]/10 border border-[#B3432E]/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-medium py-2.5 transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          Don't have an account? Ask your fleet admin to set one up for you.
        </p>
      </div>
    </main>
  );
}
