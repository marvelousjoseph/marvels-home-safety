import Navbar from "@/components/Navbar";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function getAlerts() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading alerts:", error);
    return [];
  }

  return data ?? [];
}

export default async function AlertsPage() {
  const alerts = await getAlerts();

  const critical = alerts.filter(
    (alert) => alert.severity === "critical" && alert.resolved === false
  );

  const warnings = alerts.filter(
    (alert) =>
      (alert.severity === "high" || alert.severity === "medium") &&
      alert.resolved === false
  );

  const resolved = alerts.filter((alert) => alert.resolved === true);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-medium text-blue-400">
          MARVEL&apos;S HOME SAFETY
        </p>

        <h1 className="mt-2 text-4xl font-bold">Alerts</h1>

        <p className="mt-2 text-slate-400">
          Review security events and potential threats around your home.
        </p>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-6">
            <p className="text-sm text-slate-400">Critical</p>

            <p className="mt-3 text-3xl font-bold">
              {critical.length}
            </p>

            <p className="mt-2 text-sm text-red-400">
              {critical.length === 0
                ? "No critical alerts"
                : "Critical alerts"}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-900 bg-yellow-950/30 p-6">
            <p className="text-sm text-slate-400">Warnings</p>

            <p className="mt-3 text-3xl font-bold">
              {warnings.length}
            </p>

            <p className="mt-2 text-sm text-yellow-400">
              {warnings.length === 0
                ? "No warnings"
                : "Active warnings"}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-900 bg-emerald-950/30 p-6">
            <p className="text-sm text-slate-400">Resolved</p>

            <p className="mt-3 text-3xl font-bold">
              {resolved.length}
            </p>

            <p className="mt-2 text-sm text-emerald-400">
              Resolved alerts
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Recent Alerts</h2>

          <div className="mt-6 space-y-4">
            {alerts.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="font-medium">No alerts found</p>

                <p className="mt-2 text-sm text-slate-400">
                  There are currently no security alerts in your home.
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          alert.resolved
                            ? "bg-emerald-500/20 text-emerald-400"
                            : alert.severity === "critical"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {alert.resolved
                          ? "RESOLVED"
                          : alert.severity.toUpperCase()}
                      </span>

                      <p className="font-medium">{alert.title}</p>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {alert.description}
                    </p>
                  </div>

                  <span className="text-sm text-slate-500">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
