import Navbar from "@/components/Navbar";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const supabase = await createSupabaseServerClient();

  const { data: alerts, error } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading dashboard alerts:", error);
    return [];
  }

  return alerts ?? [];
}

export default async function Dashboard() {
  const alerts = await getDashboardData();

  const activeAlerts = alerts.filter((alert) => alert.resolved === false);

  const criticalAlerts = activeAlerts.filter(
    (alert) => alert.severity === "critical"
  );

  const hasCritical = criticalAlerts.length > 0;
  const hasWarnings = activeAlerts.length > 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
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
        <section
          className={`mt-8 rounded-2xl border p-6 ${
            hasCritical
              ? "border-red-800 bg-red-950/40"
              : hasWarnings
                ? "border-yellow-800 bg-yellow-950/40"
                : "border-emerald-800 bg-emerald-950/40"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className={`text-sm ${
                  hasCritical
                    ? "text-red-400"
                    : hasWarnings
                      ? "text-yellow-400"
                      : "text-emerald-400"
                }`}
              >
                HOME STATUS
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {hasCritical
                  ? "Your home needs attention"
                  : hasWarnings
                    ? "Your home has active warnings"
                    : "Your home is secure"}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {hasCritical
                  ? "A critical security alert requires your attention."
                  : hasWarnings
                    ? `${activeAlerts.length} active security alert${
                        activeAlerts.length === 1 ? "" : "s"
                      } detected.`
                    : "No active security alerts have been detected."}
              </p>
            </div>

            <div
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                hasCritical
                  ? "bg-red-500/20 text-red-400"
                  : hasWarnings
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              ● {hasCritical ? "DANGER" : hasWarnings ? "WARNING" : "SAFE"}
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
            <p className="mt-3 text-3xl font-bold">
              {criticalAlerts.some(
                (alert) => alert.title === "Smoke Detected"
              )
                ? "ALERT"
                : "Normal"}
            </p>

            <p
              className={`mt-2 text-sm ${
                criticalAlerts.some(
                  (alert) => alert.title === "Smoke Detected"
                )
                  ? "text-red-400"
                  : "text-emerald-400"
              }`}
            >
              {criticalAlerts.some(
                (alert) => alert.title === "Smoke Detected"
              )
                ? "Smoke alert detected"
                : "No smoke detected"}
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
            <p className="mt-3 text-3xl font-bold">
              {activeAlerts.length}
            </p>

            <p
              className={`mt-2 text-sm ${
                activeAlerts.length > 0
                  ? "text-yellow-400"
                  : "text-emerald-400"
              }`}
            >
              {activeAlerts.length > 0
                ? "Active security alerts"
                : "No active threats"}
            </p>
          </div>
        </section>

        {/* Main Dashboard */}
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Recent Alerts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Activity</h2>

              <a
                href="/alerts"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                View all
              </a>
            </div>

            <div className="mt-6 space-y-4">
              {alerts.length === 0 ? (
                <div className="rounded-xl bg-slate-800/60 p-4">
                  <p className="font-medium">No recent activity</p>
                  <p className="mt-1 text-sm text-slate-400">
                    No security alerts have been recorded.
                  </p>
                </div>
              ) : (
                alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between rounded-xl bg-slate-800/60 p-4"
                  >
                    <div>
                      <p className="font-medium">{alert.title}</p>

                      <p className="text-sm text-slate-400">
                        {alert.description}
                      </p>
                    </div>

                    <span className="ml-4 text-right text-sm text-slate-500">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
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
      </div>
    </main>
  );
}
