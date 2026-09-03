import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardRealtime from "@/components/DashboardRealtime";
import LiveCamera from "@/components/cameras/LiveCamera";
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

  if (type.includes("door")) return "D";
  if (type.includes("window")) return "W";
  if (type.includes("smoke")) return "S";
  if (type.includes("camera")) return "C";

  return "E";
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

  const cameras = devices.filter((device) => {
    const type = `${device.type ?? ""} ${device.name ?? ""}`.toLowerCase();
    return (
      type.includes("camera") ||
      type.includes("cctv")
    );
  });

  const hasCriticalAlert = criticalAlerts.length > 0;

  const hasSeriousAlert =
    hasCriticalAlert || highAlerts.length > 0;

  let statusTitle = "Your home is secure";
  let statusDescription =
    "No active security alerts have been detected.";
  let statusLabel = "SAFE";

  if (hasCriticalAlert) {
    statusTitle = "Critical security alert";
    statusDescription =
      "A critical security event requires your attention.";
    statusLabel = "CRITICAL";
  } else if (hasSeriousAlert) {
    statusTitle = "Security alert detected";
    statusDescription =
      "There are active security events that need your attention.";
    statusLabel = "ALERT";
  } else if (activeAlerts.length > 0) {
    statusTitle = "Attention needed";
    statusDescription =
      "There are active security events in your home.";
    statusLabel = "ATTENTION";
  }

  const systemOnline =
    devices.length > 0 &&
    onlineDevices.length === devices.length;

  return (
    <main className="marvels-app-background min-h-screen text-white">
      <DashboardRealtime />

      <DashboardNavbar />

      <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-7 lg:px-9 lg:py-8">

        {/* Command Header */}
        <header className="border-b border-slate-800/80 pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-400">
                  Security Command Center
                </p>
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Monitor your home, connected devices and security activity
                from one control center.
              </p>
            </div>

            <div className="flex items-center gap-4 self-start border border-slate-800 bg-slate-950/60 px-4 py-3 lg:self-auto">
              <span
                className={`h-2 w-2 rounded-full ${
                  systemOnline
                    ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
                    : "bg-yellow-400"
                }`}
              />

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  System
                </p>

                <p
                  className={`mt-0.5 text-xs font-semibold ${
                    systemOnline
                      ? "text-emerald-400"
                      : "text-yellow-400"
                  }`}
                >
                  {systemOnline ? "ONLINE" : "ATTENTION"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Security Status */}
        <section className="mt-6">
          <div
            className={`border ${
              hasCriticalAlert
                ? "border-red-500/30 bg-red-950/15"
                : hasSeriousAlert
                  ? "border-orange-500/30 bg-orange-950/10"
                  : activeAlerts.length > 0
                    ? "border-yellow-500/30 bg-yellow-950/10"
                    : "border-emerald-500/20 bg-emerald-950/10"
            }`}
          >
            <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border ${
                    hasCriticalAlert
                      ? "border-red-500/30 text-red-400"
                      : hasSeriousAlert
                        ? "border-orange-500/30 text-orange-400"
                        : activeAlerts.length > 0
                          ? "border-yellow-500/30 text-yellow-400"
                          : "border-emerald-500/25 text-emerald-400"
                  }`}
                >
                  <span className="text-xs">●</span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Home Security Status
                    </p>

                    <span
                      className={`text-[9px] font-bold tracking-[0.16em] ${
                        hasCriticalAlert
                          ? "text-red-400"
                          : hasSeriousAlert
                            ? "text-orange-400"
                            : activeAlerts.length > 0
                              ? "text-yellow-400"
                              : "text-emerald-400"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <h2 className="mt-1.5 text-xl font-semibold">
                    {statusTitle}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {statusDescription}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 border border-slate-800/80 bg-slate-950/40">
                <div className="border-r border-slate-800/80 px-5 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-slate-600">
                    Alerts
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {activeAlerts.length}
                  </p>
                </div>

                <div className="border-r border-slate-800/80 px-5 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-slate-600">
                    Devices
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {devices.length}
                  </p>
                </div>

                <div className="px-5 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-slate-600">
                    Online
                  </p>

                  <p className="mt-1 text-lg font-semibold text-emerald-400">
                    {onlineDevices.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Metrics */}
        <section className="mt-5 grid border border-slate-800/80 bg-slate-950/40 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-b border-slate-800/80 p-5 sm:border-r lg:border-b-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Active Alerts
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-2xl font-semibold">
                {activeAlerts.length}
              </p>

              <span
                className={`text-[10px] font-medium ${
                  activeAlerts.length === 0
                    ? "text-emerald-400"
                    : "text-orange-400"
                }`}
              >
                {activeAlerts.length === 0
                  ? "Clear"
                  : "Requires attention"}
              </span>
            </div>
          </div>

          <div className="border-b border-slate-800/80 p-5 lg:border-b-0 lg:border-r">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Connected Devices
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-2xl font-semibold">
                {devices.length}
              </p>

              <span className="text-[10px] font-medium text-blue-400">
                {onlineDevices.length} online
              </span>
            </div>
          </div>

          <div className="border-b border-slate-800/80 p-5 sm:border-r lg:border-b-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Critical Events
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-2xl font-semibold">
                {criticalAlerts.length}
              </p>

              <span
                className={`text-[10px] font-medium ${
                  criticalAlerts.length === 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {criticalAlerts.length === 0
                  ? "None"
                  : "Immediate action"}
              </span>
            </div>
          </div>

          <div className="p-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Cameras
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-2xl font-semibold">
                {cameras.length}
              </p>

              <span className="text-[10px] font-medium text-slate-500">
                Security cameras
              </span>
            </div>
          </div>
        </section>

        {/* Main Monitoring Area */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">

          {/* CCTV / Monitoring */}
          <div className="border border-slate-800/80 bg-[#020811]">
            <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />

                  <h2 className="text-sm font-semibold">
                    Security Monitoring
                  </h2>
                </div>

                <p className="mt-1 text-[11px] text-slate-600">
                  Live camera infrastructure
                </p>
              </div>

              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                CCTV
              </span>
            </div>

            <div className="p-4 sm:p-5">
              {cameras.length > 0 ? (
                <LiveCamera
                  cameraId={cameras[0].id}
                  cameraName={cameras[0].name || "Security Camera"}
                  cameraLocation={cameras[0].location}
                />
              ) : (
                <div className="flex min-h-[360px] items-center justify-center bg-black">
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm font-medium text-slate-300">
                      No security camera detected
                    </p>

                    <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600">
                      Connect a camera device to enable live monitoring.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Marvels branding under CCTV */}
            <div className="flex items-center justify-center border-t border-slate-800/80 bg-[#030a14] px-4 py-4">
              <div className="relative h-10 w-44 opacity-90">
                <img
                  src="/marvels-home-safety-logo-transparent.png"
                  alt="Marvels Home Safety"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Device Status */}
          <div className="border border-slate-800/80 bg-[#020811]">
            <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  Device Status
                </h2>

                <p className="mt-1 text-[11px] text-slate-600">
                  Connected security hardware
                </p>
              </div>

              <a
                href="/devices"
                className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-300"
              >
                Manage
              </a>
            </div>

            <div className="divide-y divide-slate-800/70">
              {devices.length === 0 ? (
                <div className="px-5 py-8">
                  <p className="text-sm font-medium">
                    No devices connected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Add a security device to begin monitoring your home.
                  </p>
                </div>
              ) : (
                devices.slice(0, 6).map((device) => {
                  const isOnline =
                    device.status?.toLowerCase() === "online";

                  return (
                    <div
                      key={device.id}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-900/40"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            isOnline
                              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                              : "bg-slate-600"
                          }`}
                        />

                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-slate-300">
                            {device.name}
                          </p>

                          <p className="mt-1 truncate text-[10px] text-slate-600">
                            {device.location ||
                              device.type ||
                              "Security device"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider ${
                          isOnline
                            ? "text-emerald-400"
                            : "text-slate-600"
                        }`}
                      >
                        {device.status || "Unknown"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Activity + Alerts */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">

          {/* Activity */}
          <div className="border border-slate-800/80 bg-[#020811]">
            <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  Recent Security Activity
                </h2>

                <p className="mt-1 text-[11px] text-slate-600">
                  Latest events reported by your security devices.
                </p>
              </div>

              <a
                href="/activity"
                className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-300"
              >
                View all
              </a>
            </div>

            <div className="divide-y divide-slate-800/70">
              {events.length === 0 ? (
                <div className="px-5 py-8">
                  <p className="text-sm font-medium">
                    No security activity yet
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
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
                      className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-800 bg-slate-950 text-[10px] font-semibold text-blue-400">
                          {getEventIcon(event.event_type)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-xs font-medium text-slate-300">
                              {device?.name || "Security Device"}
                            </p>

                            <span className="text-[8px] font-semibold uppercase tracking-wider text-blue-400">
                              {event.event_type
                                ?.replaceAll("_", " ")
                                .toUpperCase()}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {event.description}
                          </p>

                          {device?.location && (
                            <p className="mt-1 text-[10px] text-slate-700">
                              {device.location}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="shrink-0 text-[10px] text-slate-700">
                        {formatEventTime(event.created_at)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className="border border-slate-800/80 bg-[#020811]">
            <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  Active Alerts
                </h2>

                <p className="mt-1 text-[11px] text-slate-600">
                  Events requiring attention.
                </p>
              </div>

              <a
                href="/alerts"
                className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-300"
              >
                Open alerts
              </a>
            </div>

            <div className="divide-y divide-slate-800/70">
              {activeAlerts.length === 0 ? (
                <div className="px-5 py-8">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    <p className="text-sm font-medium text-slate-300">
                      No active alerts
                    </p>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    Your home currently has no unresolved security alerts.
                  </p>
                </div>
              ) : (
                activeAlerts.slice(0, 5).map((alert) => {
                  const severity =
                    alert.severity?.toLowerCase() ?? "unknown";

                  const severityClass =
                    severity === "critical"
                      ? "text-red-400"
                      : severity === "high"
                        ? "text-orange-400"
                        : severity === "medium"
                          ? "text-yellow-400"
                          : "text-slate-400";

                  return (
                    <div
                      key={alert.id}
                      className="px-5 py-4 transition hover:bg-slate-900/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-slate-300">
                            {alert.title ||
                              alert.message ||
                              "Security alert"}
                          </p>

                          {alert.message &&
                            alert.title && (
                              <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-slate-600">
                                {alert.message}
                              </p>
                            )}
                        </div>

                        <span
                          className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider ${severityClass}`}
                        >
                          {severity}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Account / Existing actions */}
        <div className="mt-6">
            </div>
      </div>
    </main>
  );
}
