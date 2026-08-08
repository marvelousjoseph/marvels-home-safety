import Navbar from "@/components/Navbar";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-8 py-10">
        <h1 className="text-4xl font-bold">
          Security Dashboard
        </h1>

        <p className="mt-2 text-slate-400">
          Monitor your home security from one place.
        </p>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Home Status</p>
            <h2 className="mt-3 text-2xl font-bold text-green-400">
              Safe
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Cameras</p>
            <h2 className="mt-3 text-2xl font-bold">
              3 Online
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Recent Alerts</p>
            <h2 className="mt-3 text-2xl font-bold">
              1
            </h2>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">
            Recent Activity
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between border-b border-slate-800 pb-4">
              <span>Recognized person detected</span>
              <span className="text-slate-400">10:42 AM</span>
            </div>

            <div className="flex justify-between border-b border-slate-800 pb-4">
              <span>Front door activity</span>
              <span className="text-slate-400">09:15 AM</span>
            </div>

            <div className="flex justify-between">
              <span>Unknown visitor detected</span>
              <span className="text-slate-400">08:31 AM</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}