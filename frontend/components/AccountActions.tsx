"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AccountActions() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-slate-500">
            ACCOUNT
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Account & Security
          </h2>

          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Your account controls are kept here so the main navigation
            stays focused on home security.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="shrink-0 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-red-900 hover:bg-red-950/30 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loggingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </section>
  );
}
