import Navbar from "@/components/Navbar";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function formatAlertTime(createdAt: string | null) {
  if (!createdAt) return "Unknown time";

  const created = new Date(createdAt);
  const now = new Date();
  const difference = now.getTime() - created.getTime();

  if (difference < 0) {
    return created.toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return created.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

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
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <section>
          <p className="text-sm font-semibold tracking-wider text-blue-400">
            MARVEL&apos;S HOME SAFETY
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Security Dashboard
              </h1>

              <p className="mt-2 text-slate-400">
                Monitor and protect your home from one place.
              </p>
            </div>

            <div className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
              SYSTEM MONITORING ACTIVE
            </div>
          </div>
        </section>

        {/* Home Status */}
        <section
          className={`mt-8 overflow-hidden rounded-3xl border p-6 md:p-8 ${
            hasCriticalAlert
              ? "border-red-900 bg-red-950/30"
              : hasSeriousAlert
                ? "border-orange-900 bg-orange-950/30"
                : activeAlerts.length > 0
                  ? "border-yellow-900 bg-yellow-950/30"
                  : "border-emerald-900 bg-emerald-950/30"
          }`}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  hasCriticalAlert
                    ? "bg-red-500/20 text-red-400"
                    : hasSeriousAlert
                      ? "bg-orange-500/20 text-orange-400"
                      : activeAlerts.length > 0
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                <span className="text-xl">●</span>
              </div>

              <div>
                <p
                  className={`text-xs font-bold tracking-widest ${
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

                <p className="mt-1 max-w-xl text-sm text-slate-400">
                  {statusDescription}
                </p>
              </div>
            </div>

            <div
              className={`rounded-full px-5 py-2 text-sm font-bold ${
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

        {/* Statistics */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Active Alerts</p>

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

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Connected Devices</p>

            <p className="mt-3 text-3xl font-bold">
              {devices.length}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {onlineDevices.length} online
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Critical Alerts</p>

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

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">System Status</p>

            <p className="mt-3 text-3xl font-bold">
              {devices.length > 0 &&
              onlineDevices.length === devices.length
                ? "Online"
                : "Attention"}
            </p>

            <p
              className={`mt-2 text-sm ${
                devices.length > 0 &&
                onlineDevices.length === devices.length
                  ? "text-emerald-400"
                  : "text-yellow-400"
              }`}
            >
              {devices.length > 0
                ? `${onlineDevices.length} of ${devices.length} devices online`
                : "No devices connected"}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Recent Security Activity
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Latest events reported by your security system.
                </p>
              </div>

              <a
                href="/alerts"
                className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
              >
                View all
              </a>
            </div>

            <div className="mt-6 space-y-3">
              {alerts.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
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
                    className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ${
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

                        <p className="truncate font-medium">
                          {alert.title}
                        </p>
                      </div>

                      <p className="mt-2 text-sm text-slate-400">
                        {alert.description}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm text-slate-500">
                      {formatAlertTime(alert.created_at)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Device Overview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div>
              <h2 className="text-xl font-bold">
                Device Overview
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Security devices connected to your home.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {devices.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                  <p className="font-medium">
                    No devices connected
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Add a security device to get started.
                  </p>
                </div>
              ) : (
                devices.slice(0, 5).map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {device.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {device.location || device.type || "Security device"}
                      </p>
                    </div>

                    <div className="ml-3 flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          device.status?.toLowerCase() === "online"
                            ? "bg-emerald-400"
                            : "bg-slate-600"
                        }`}
                      />

                      <span className="text-xs font-medium text-slate-400">
                        {device.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <a
              href="/devices"
              className="mt-5 block rounded-xl border border-slate-700 py-3 text-center text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Manage devices
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
