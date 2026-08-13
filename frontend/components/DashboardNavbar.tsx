"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardNavbar() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold shadow-lg shadow-blue-600/20">
            M
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              Marvel&apos;s
            </p>

            <p className="text-xs text-slate-400">
              Home Safety
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/dashboard"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Dashboard
          </Link>

          <Link
            href="/home"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Home
          </Link>

          <Link
            href="/security"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Security
          </Link>

          <Link
            href="/alerts"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Alerts
          </Link>

          <Link
            href="/devices"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Devices
          </Link>

          <Link
            href="/activity"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Activity
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="ml-3 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Log Out
          </button>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}
