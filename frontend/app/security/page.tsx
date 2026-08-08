"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default function SecurityPage() {
  const [armed, setArmed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSecurityStatus();
  }, []);

  async function loadSecurityStatus() {
    const { data, error } = await supabase
      .from("security_status")
      .select("armed")
      .limit(1)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setArmed(data.armed);
    setLoading(false);
  }

  async function updateSecurityStatus(nextStatus: boolean) {
    setUpdating(true);

    const { data, error } = await supabase
      .from("security_status")
      .update({
        armed: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .select("armed")
      .single();

    if (error) {
      console.error(error);
      alert("Unable to update security status.");
      setUpdating(false);
      return;
    }

    setArmed(data.armed);
    setUpdating(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-medium text-blue-400">
          MARVEL&apos;S HOME SAFETY
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Security
        </h1>

        <p className="mt-2 text-slate-400">
          Control and monitor the security of your home.
        </p>

        <section
          className={`mt-8 rounded-2xl border p-6 ${
            armed
              ? "border-emerald-800 bg-emerald-950/40"
              : "border-yellow-800 bg-yellow-950/40"
          }`}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className={`text-sm ${
                  armed
                    ? "text-emerald-400"
                    : "text-yellow-400"
                }`}
              >
                SECURITY STATUS
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {loading
                  ? "Checking security..."
                  : armed
                    ? "Your home is secure"
                    : "Security is currently disarmed"}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {armed
                  ? "Your security system is currently protecting your home."
                  : "Your security system is currently not armed."}
              </p>
            </div>

            {!loading && (
              <div
                className={`rounded-full px-5 py-2 text-sm font-semibold ${
                  armed
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                ● {armed ? "ARMED" : "DISARMED"}
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Doors
            </p>

            <p className="mt-3 text-3xl font-bold">
              4 / 4
            </p>

            <p className="mt-2 text-sm text-emerald-400">
              Secured
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Windows
            </p>

            <p className="mt-3 text-3xl font-bold">
              4 / 4
            </p>

            <p className="mt-2 text-sm text-emerald-400">
              Secured
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Active Threats
            </p>

            <p className="mt-3 text-3xl font-bold">
              0
            </p>

            <p className="mt-2 text-sm text-emerald-400">
              No threats detected
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Security Controls
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => updateSecurityStatus(true)}
              disabled={updating || armed === true}
              className="rounded-xl bg-emerald-600 px-5 py-4 font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating && !armed
                ? "Updating..."
                : "Arm Security"}
            </button>

            <button
              onClick={() => updateSecurityStatus(false)}
              disabled={updating || armed === false}
              className="rounded-xl border border-slate-700 px-5 py-4 font-semibold hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating && armed
                ? "Updating..."
                : "Disarm Security"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
