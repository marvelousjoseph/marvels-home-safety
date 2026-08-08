import Navbar from "@/components/Navbar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-medium text-blue-400">
            MARVEL&apos;S HOME SAFETY
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Security Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Monitor and protect your home from one place.
          </p>
        </div>

        {/* Home Status */}
        <section className="mt-8 rounded-2xl border border-emerald-800 bg-emerald-950/40 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-emerald-400">HOME STATUS</p>
              <h2 className="mt-1 text-2xl font-bold">
                Your home is secure
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                All monitored devices are currently operating normally.
              </p>
            </div>

            <div className="rounded-full bg-emerald-500/20 px-5 py-2 text-sm font-semibold text-emerald-400">
              ● SAFE
            </div>
          </div>
        </section>

        {/* Security Cards */}
        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Doors & Windows</p>
            <p className="mt-3 text-3xl font-bold">8 / 8</p>
            <p className="mt-2 text-sm text-emerald-400">
              All secured
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Smoke Detection</p>
            <p className="mt-3 text-3xl font-bold">Normal</p>
            <p className="mt-2 text-sm text-emerald-400">
              No smoke detected
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Cameras</p>
            <p className="mt-3 text-3xl font-bold">4 / 4</p>
            <p className="mt-2 text-sm text-emerald-400">
              Online
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Active Alerts</p>
            <p className="mt-3 text-3xl font-bold">0</p>
            <p className="mt-2 text-emerald-400">
              No active threats
            </p>
          </div>
        </section>

        {/* Main Dashboard */}
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Recent Alerts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Activity</h2>

              <button className="text-sm text-blue-400 hover:text-blue-300">
                View all
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-800/60 p-4">
                <div>
                  <p className="font-medium">Front door secured</p>
                  <p className="text-sm text-slate-400">
                    Security system
                  </p>
                </div>
                <span className="text-sm text-slate-500">
                  5 min ago
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-800/60 p-4">
                <div>
                  <p className="font-medium">Camera connected</p>
                  <p className="text-sm text-slate-400">
                    Living room camera
                  </p>
                </div>
                <span className="text-sm text-slate-500">
                  18 min ago
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-800/60 p-4">
                <div>
                  <p className="font-medium">System armed</p>
                  <p className="text-sm text-slate-400">
                    Home security
                  </p>
                </div>
                <span className="text-sm text-slate-500">
                  1 hr ago
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Emergency Contact
            </h2>

            <div className="mt-6">
              <p className="text-lg font-medium">
                Emergency Contact
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Primary contact
              </p>

              <button className="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold hover:bg-red-500">
                Emergency Alert
              </button>

              <p className="mt-3 text-center text-xs text-slate-500">
                Use only during a real emergency.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
