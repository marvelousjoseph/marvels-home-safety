import Navbar from "@/components/Navbar";

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-medium text-blue-400">
          MARVEL&apos;S HOME SAFETY
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Alerts
        </h1>

        <p className="mt-2 text-slate-400">
          Review security events and potential threats around your home.
        </p>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-6">
            <p className="text-sm text-slate-400">
              Critical
            </p>

            <p className="mt-3 text-3xl font-bold">
              0
            </p>

            <p className="mt-2 text-sm text-red-400">
              No critical alerts
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-900 bg-yellow-950/30 p-6">
            <p className="text-sm text-slate-400">
              Warnings
            </p>

            <p className="mt-3 text-3xl font-bold">
              0
            </p>

            <p className="mt-2 text-sm text-yellow-400">
              No warnings
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-900 bg-emerald-950/30 p-6">
            <p className="text-sm text-slate-400">
              Resolved
            </p>

            <p className="mt-3 text-3xl font-bold">
              3
            </p>

            <p className="mt-2 text-sm text-emerald-400">
              Recently resolved
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Recent Alerts
            </h2>

            <button className="text-sm text-blue-400 hover:text-blue-300">
              Clear resolved
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                    RESOLVED
                  </span>

                  <p className="font-medium">
                    Front door opened
                  </p>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  The front door sensor detected activity.
                </p>
              </div>

              <span className="text-sm text-slate-500">
                1 hour ago
              </span>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                    RESOLVED
                  </span>

                  <p className="font-medium">
                    Camera disconnected
                  </p>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Living room camera briefly went offline.
                </p>
              </div>

              <span className="text-sm text-slate-500">
                3 hours ago
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="font-medium">
                No active security threats
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Your home is currently being monitored normally.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
