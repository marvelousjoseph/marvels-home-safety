import Navbar from "@/components/Navbar";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      alerts: [],
      devices: [],
    };
  }

  const { data: membership } = await supabase
    .from("home_members")
    .select("home_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.home_id) {
    return {
      alerts: [],
      devices: [],
    };
  }

  const homeId = membership.home_id;

  const [{ data: alerts }, { data: devices }] = await Promise.all([
    supabase
      .from("alerts")
      .select("*")
      .eq("home_id", homeId)
      .order("created_at", { ascending: false }),

    supabase
      .from("devices")
      .select("*")
      .eq("home_id", homeId)
      .order("name", { ascending: true }),
  ]);

  return {
    alerts: alerts ?? [],
    devices: devices ?? [],
  };
}

export default async function Dashboard() {
  const { alerts, devices } = await getDashboardData();

  const activeAlerts = alerts.filter(
    (alert) => alert.resolved === false
  );

  const criticalAlerts = activeAlerts.filter(
    (alert) => alert.severity?.toLowerCase() === "critical"
  );

  const highAlerts = activeAlerts.filter(
    (alert) => alert.severity?.toLowerCase() === "high"
  );

  const onlineDevices = devices.filter(
    (device) => device.status?.toLowerCase() === "online"
  );

  const hasCriticalAlert = criticalAlerts.length > 0;
  const hasSeriousAlert =
    hasCriticalAlert || highAlerts.length > 0;

  let statusTitle = "Your home is secure";
  let statusDescription =
    "No active security alerts have been detected.";
  let statusLabel = "● SAFE";

  if (hasCriticalAlert) {
    statusTitle = "Critical security alert";
    statusDescription =
      "A critical security event requires your attention.";
    statusLabel = "● CRITICAL";
  } else if (hasSeriousAlert) {
    statusTitle = "Security alert detected";
    statusDescription =
      "There are active security events that need your attention.";
    statusLabel = "● ALERT";
  } else if (activeAlerts.length > 0) {
    statusTitle = "Attention needed";
    statusDescription =
      "There are active security events in your home.";
    statusLabel = "● ATTENTION";
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
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
            hasCriticalAlert
              ? "border-red-800 bg-red-950/40"
              : hasSeriousAlert
                ? "border-orange-800 bg-orange-950/40"
                : activeAlerts.length > 0
                  ? "border-yellow-800 bg-yellow-950/40"
                  : "border-emerald-800 bg-emerald-950/40"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className={`text-sm font-semibold ${
                  hasCriticalAlert
                    ? "text-red-400"
                    : hasSeriousAlert
                      ? "text-orange-400"
                      : activeAlerts.length > 0
                        ? "text-yellow-400"
                        : "text-emerald-400"
                }`}
              >
                HOME STATUS
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {statusTitle}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {statusDescription}
              </p>
            </div>

            <div
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                hasCriticalAlert
                  ? "bg-red-500/20 text-red-400"
                  : hasSeriousAlert
                    ? "bg-orange-500/20 text-orange-400"
                    : activeAlerts.length > 0
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {statusLabel}
            </div>
          </div>
        </section>

        {/* Security Cards */}
        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Active Alerts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Active Alerts
            </p>

            <p className="mt-3 text-3xl font-bold">
              {activeAlerts.length}
            </p>

            <p
              className={`mt-2 text-sm ${
                activeAlerts.length === 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {activeAlerts.length === 0
                ? "No active threats"
                : "Requires attention"}
            </p>
          </div>

          {/* Devices */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Devices
            </p>

            <p className="mt-3 text-3xl font-bold">
              {devices.length}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {onlineDevices.length} online
            </p>
          </div>

          {/* Critical Alerts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Critical Alerts
            </p>

            <p className="mt-3 text-3xl font-bold">
              {criticalAlerts.length}
            </p>

            <p
              className={`mt-2 text-sm ${
                criticalAlerts.length === 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {criticalAlerts.length === 0
                ? "None detected"
                : "Immediate attention"}
            </p>
          </div>

          {/* System Status */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              System Status
            </p>

            <p className="mt-3 text-3xl font-bold">
              {devices.length > 0 &&
              onlineDevices.length === devices.length
                ? "Online"
                : "Attention"}
            </p>

            <p className="mt-2 text-sm text-emerald-400">
              {devices.length > 0
                ? `${onlineDevices.length} of ${devices.length} devices online`
                : "No devices connected"}
            </p>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Recent Activity
            </h2>

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
                <p className="font-medium">
                  No security activity yet
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Your home has not reported any alerts.
                </p>
              </div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col gap-3 rounded-xl bg-slate-800/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          alert.resolved
                            ? "bg-emerald-500/20 text-emerald-400"
                            : alert.severity?.toLowerCase() ===
                                "critical"
                              ? "bg-red-500/20 text-red-400"
                              : alert.severity?.toLowerCase() ===
                                  "high"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {alert.resolved
                          ? "RESOLVED"
                          : alert.severity?.toUpperCase()}
                      </span>

                      <p className="font-medium">
                        {alert.title}
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {alert.description}
                    </p>
                  </div>

                  <span className="text-sm text-slate-500">
                    {new Date(
                      alert.created_at
                    ).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
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
        </section>
      </main>
    </>
  );
}
