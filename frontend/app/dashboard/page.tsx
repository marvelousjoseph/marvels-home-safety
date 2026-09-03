import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardRealtime from "@/components/DashboardRealtime";
import AccountActions from "@/components/AccountActions";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function formatEventTime(createdAt: string | null) {
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

function getEventIcon(eventType: string | null) {
  const type = eventType?.toLowerCase() ?? "";

  if (type.includes("door")) return "🚪";
  if (type.includes("window")) return "🪟";
  if (type.includes("smoke")) return "🔥";
  if (type.includes("camera")) return "📹";

  return "📡";
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
      events: [],
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
      events: [],
    };
  }

  const homeId = membership.home_id;

  const [{ data: alerts }, { data: devices }, { data: events }] =
    await Promise.all([
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

      supabase
        .from("device_events")
        .select(`
          id,
          home_id,
          device_id,
          event_type,
          description,
          created_at,
          devices (
            name,
            type,
            location
          )
        `)
        .eq("home_id", homeId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return {
    alerts: alerts ?? [],
    devices: devices ?? [],
    events: events ?? [],
  };
}

export default async function Dashboard() {
  const { alerts, devices, events } = await getDashboardData();

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

  const systemOnline =
    devices.length > 0 &&
    onlineDevices.length === devices.length;

  return (
    <main className="marvels-app-background min-h-screen text-white">
      <DashboardRealtime />

      <DashboardNavbar />

      <div className="marvels-grid mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">

        {/* Header */}
        <section>
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(46,168,255,0.8)]" />
                <p className="text-xs font-bold tracking-[0.28em] text-blue-400">
                  MARVELS HOME SAFETY
                </p>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Security Dashboard
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Monitor and protect your home from one secure control center.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-full border border-blue-400/15 bg-blue-500/[0.06] px-4 py-2.5 md:self-auto">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-400" />
              </span>

              <span className="text-[10px] font-bold tracking-[0.18em] text-blue-300">
                SYSTEM MONITORING ACTIVE
              </span>
            </div>
          </div>
        </section>

        {/* Home Status */}
        <section
          className={`relative mt-8 overflow-hidden rounded-3xl border p-6 md:p-8 ${
            hasCriticalAlert
              ? "border-red-500/25 bg-gradient-to-br from-red-950/50 via-[#07111f] to-[#030712]"
              : hasSeriousAlert
                ? "border-orange-500/25 bg-gradient-to-br from-orange-950/35 via-[#07111f] to-[#030712]"
                : activeAlerts.length > 0
                  ? "border-yellow-500/25 bg-gradient-to-br from-yellow-950/25 via-[#07111f] to-[#030712]"
                  : "border-emerald-500/20 bg-gradient-to-br from-emerald-950/25 via-[#07111f] to-[#030712]"
          }`}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/[0.06] blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${
                  hasCriticalAlert
                    ? "border-red-400/20 bg-red-500/10 text-red-400"
                    : hasSeriousAlert
                      ? "border-orange-400/20 bg-orange-500/10 text-orange-400"
                      : activeAlerts.length > 0
                        ? "border-yellow-400/20 bg-yellow-500/10 text-yellow-400"
                        : "border-emerald-400/20 bg-emerald-500/10 text-emerald-400"
                }`}
              >
                <span className="text-xl">●</span>
              </div>

              <div>
                <p
                  className={`text-[10px] font-bold tracking-[0.25em] ${
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

                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  {statusTitle}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  {statusDescription}
                </p>
              </div>
            </div>

            <div
              className={`rounded-full border px-5 py-2.5 text-xs font-bold tracking-wider ${
                hasCriticalAlert
                  ? "border-red-400/20 bg-red-500/10 text-red-400"
                  : hasSeriousAlert
                    ? "border-orange-400/20 bg-orange-500/10 text-orange-400"
                    : activeAlerts.length > 0
                      ? "border-yellow-400/20 bg-yellow-500/10 text-yellow-400"
                      : "border-emerald-400/20 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {statusLabel}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="marvels-panel marvels-panel-hover rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Alerts
              </p>
              <span className="text-orange-400">!</span>
            </div>

            <p className="mt-4 text-3xl font-bold">
              {activeAlerts.length}
            </p>

            <p
              className={`mt-2 text-xs ${
                activeAlerts.length === 0
                  ? "text-emerald-400"
                  : "text-orange-400"
              }`}
            >
              {activeAlerts.length === 0
                ? "No active threats"
                : "Requires attention"}
            </p>
          </div>

          <div className="marvels-panel marvels-panel-hover rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Connected Devices
              </p>
              <span className="text-blue-400">◉</span>
            </div>

            <p className="mt-4 text-3xl font-bold">
              {devices.length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              {onlineDevices.length} online
            </p>
          </div>

          <div className="marvels-panel marvels-panel-hover rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Critical Alerts
              </p>
              <span className="text-red-400">▲</span>
            </div>

            <p className="mt-4 text-3xl font-bold">
              {criticalAlerts.length}
            </p>

            <p
              className={`mt-2 text-xs ${
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

          <div className="marvels-panel marvels-panel-hover rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                System Status
              </p>
              <span
                className={
                  systemOnline
                    ? "text-emerald-400"
                    : "text-yellow-400"
                }
              >
                ●
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold">
              {systemOnline ? "Online" : "Attention"}
            </p>

            <p
              className={`mt-2 text-xs ${
                systemOnline
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

          {/* Recent Security Activity */}
          <div className="marvels-panel rounded-2xl p-6 lg:col-span-2">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <h2 className="text-xl font-bold">
                    Recent Security Activity
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-400">
                  Latest events reported by your security devices.
                </p>
              </div>

              <a
                href="/activity"
                className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >
                View all →
              </a>
            </div>

            <div className="mt-6 space-y-3">
              {events.length === 0 ? (
                <div className="rounded-xl border border-slate-800/80 bg-[#030a14] p-5">
                  <p className="font-medium">
                    No security activity yet
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Your security devices have not reported any events.
                  </p>
                </div>
              ) : (
                events.map((event) => {
                  const device = Array.isArray(event.devices)
                    ? event.devices[0]
                    : event.devices;

                  return (
                    <div
                      key={event.id}
                      className="group flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-[#030a14] p-4 transition hover:border-blue-400/20 hover:bg-[#05101d] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-900 text-lg transition group-hover:border-blue-400/20">
                          {getEventIcon(event.event_type)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="truncate font-medium">
                              {device?.name || "Security Device"}
                            </p>

                            <span className="rounded-full border border-blue-400/10 bg-blue-500/[0.07] px-2.5 py-1 text-[9px] font-bold tracking-wider text-blue-400">
                              {event.event_type
                                ?.replaceAll("_", " ")
                                .toUpperCase()}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-400">
                            {event.description}
                          </p>

                          {device?.location && (
                            <p className="mt-1 text-xs text-slate-600">
                              {device.location}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="shrink-0 text-xs text-slate-600">
                        {formatEventTime(event.created_at)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Device Overview */}
          <div className="marvels-panel rounded-2xl p-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                <h2 className="text-xl font-bold">
                  Device Overview
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                Security devices connected to your home.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {devices.length === 0 ? (
                <div className="rounded-xl border border-slate-800/80 bg-[#030a14] p-5">
                  <p className="font-medium">
                    No devices connected
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Add a security device to get started.
                  </p>
                </div>
              ) : (
                devices.slice(0, 5).map((device) => {
                  const isOnline =
                    device.status?.toLowerCase() === "online";

                  return (
                    <div
                      key={device.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-[#030a14] p-4 transition hover:border-blue-400/20"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {device.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {device.location ||
                            device.type ||
                            "Security device"}
                        </p>
                      </div>

                      <div className="ml-3 flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isOnline
                              ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.65)]"
                              : "bg-slate-600"
                          }`}
                        />

                        <span
                          className={`text-[10px] font-semibold ${
                            isOnline
                              ? "text-emerald-400"
                              : "text-slate-500"
                          }`}
                        >
                          {device.status || "Unknown"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <a
              href="/devices"
              className="mt-5 block rounded-xl border border-slate-700/80 bg-white/[0.015] py-3 text-center text-sm font-semibold text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-500/[0.06] hover:text-white"
            >
              Manage devices
            </a>
          </div>
        </section>

        {/* Account */}
        <AccountActions />
      </div>
    </main>
  );
}