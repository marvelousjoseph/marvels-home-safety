import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import SecurityRealtime from "@/components/SecurityRealtime";
import LiveCamera from "@/components/cameras/LiveCamera";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { armSystem, disarmSystem } from "./actions";

export const dynamic = "force-dynamic";

async function getSecurityData() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      armed: false,
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
      armed: false,
      alerts: [],
      devices: [],
    };
  }

  const homeId = membership.home_id;

  const [{ data: securityStatus }, { data: alerts }, { data: devices }] =
    await Promise.all([
      supabase
        .from("security_status")
        .select("armed")
        .eq("home_id", homeId)
        .maybeSingle(),

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
    armed: securityStatus?.armed ?? false,
    alerts: alerts ?? [],
    devices: devices ?? [],
  };
}

type SecurityData = Awaited<ReturnType<typeof getSecurityData>>;
type SecurityDevice = SecurityData["devices"][number];

function isCamera(device: SecurityDevice) {
  return device.type?.toLowerCase().includes("camera");
}

function isOnline(device: SecurityDevice) {
  return device.status?.toLowerCase() === "online";
}

function getSeverityClasses(severity: string | null) {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "border-red-500/30 bg-red-500/10 text-red-300";

    case "high":
      return "border-orange-500/30 bg-orange-500/10 text-orange-300";

    case "medium":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";

    default:
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }
}

function formatAlertTime(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function SecurityPage() {
  const { armed, alerts, devices } = await getSecurityData();

  const activeAlerts = alerts.filter(
    (alert) => alert.resolved === false
  );

  const onlineDevices = devices.filter(isOnline);

  const cameras = devices.filter(isCamera);

  const onlineCameras = cameras.filter(isOnline);

  const criticalAlerts = activeAlerts.filter(
    (alert) => alert.severity?.toLowerCase() === "critical"
  );

  /*
   * Keep the live CCTV stream source environment-based.
   * Do not hard-code fake camera footage.
   */
  const liveStreamUrl = process.env.NEXT_PUBLIC_CCTV_STREAM_URL ?? "";

  const securityHealth =
    devices.length === 0
      ? 0
      : Math.round((onlineDevices.length / devices.length) * 100);

  return (
    <>
      <SecurityRealtime />

      <DashboardNavbar />

      <main className="min-h-screen bg-[#050914] text-white">
        {/* Background atmosphere */}
        <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-600/5 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

          {/* ========================================================= */}
          {/* HEADER                                                    */}
          {/* ========================================================= */}

          <section className="mb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-400">
                    Marvels Home Safety
                  </p>
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Security Command Center
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Monitor your home, cameras, sensors, protection status,
                  and security events from one place.
                </p>
              </div>

              <Link
                href="/alerts"
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-blue-500/40 hover:bg-slate-800"
              >
                View all alerts
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>

          {/* ========================================================= */}
          {/* TOP SECURITY OVERVIEW                                     */}
          {/* ========================================================= */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* Protection */}
            <div
              className={`relative overflow-hidden rounded-2xl border p-5 ${
                armed
                  ? "border-emerald-500/20 bg-emerald-500/[0.06]"
                  : "border-slate-800 bg-slate-900/70"
              }`}
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-400/5 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Protection
                  </span>

                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      armed
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    🛡
                  </span>
                </div>

                <p className="mt-5 text-2xl font-bold">
                  {armed ? "Armed" : "Disarmed"}
                </p>

                <p
                  className={`mt-1 text-sm ${
                    armed ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {armed
                    ? "Home is actively protected"
                    : "Protection is currently inactive"}
                </p>
              </div>
            </div>

            {/* Cameras */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Cameras
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    ◉
                  </span>
                </div>

                <p className="mt-5 text-2xl font-bold">
                  {onlineCameras.length}
                  <span className="ml-1 text-base font-medium text-slate-500">
                    / {cameras.length}
                  </span>
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  cameras online
                </p>
              </div>
            </div>

            {/* Devices */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Device Health
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    ✓
                  </span>
                </div>

                <p className="mt-5 text-2xl font-bold">
                  {securityHealth}%
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {onlineDevices.length} of {devices.length} devices online
                </p>
              </div>
            </div>

            {/* Events */}
            <div
              className={`relative overflow-hidden rounded-2xl border p-5 ${
                criticalAlerts.length > 0
                  ? "border-red-500/20 bg-red-500/[0.05]"
                  : "border-slate-800 bg-slate-900/70"
              }`}
            >
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Active Events
                  </span>

                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      criticalAlerts.length > 0
                        ? "bg-red-500/10 text-red-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    !
                  </span>
                </div>

                <p className="mt-5 text-2xl font-bold">
                  {activeAlerts.length}
                </p>

                <p
                  className={`mt-1 text-sm ${
                    criticalAlerts.length > 0
                      ? "text-red-400"
                      : "text-slate-500"
                  }`}
                >
                  {criticalAlerts.length > 0
                    ? `${criticalAlerts.length} critical event${
                        criticalAlerts.length === 1 ? "" : "s"
                      }`
                    : "No critical events"}
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* CCTV MONITORING                                           */}
          {/* ========================================================= */}

          <section className="mt-8 overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 shadow-2xl shadow-black/20">

            <div className="border-b border-slate-800/80 p-5 sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]" />

                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                      Live Security
                    </p>
                  </div>

                  <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                    CCTV Monitoring
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    Monitor connected cameras in real time. Security event
                    recordings remain available separately for investigation.
                  </p>
                </div>

                <div
                  className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${
                    onlineCameras.length > 0
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-slate-700 bg-slate-800/70 text-slate-400"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      onlineCameras.length > 0
                        ? "bg-emerald-400"
                        : "bg-slate-500"
                    }`}
                  />

                  {onlineCameras.length} camera
                  {onlineCameras.length === 1 ? "" : "s"} online
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 lg:p-7">
              {cameras.length === 0 ? (
                <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-[#050914]">
                  <div className="max-w-md px-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-2xl">
                      ◉
                    </div>

                    <h3 className="mt-5 text-lg font-semibold">
                      No CCTV cameras connected
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Connect a camera device to your home to begin live CCTV
                      monitoring.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {cameras.map((camera) => {
                    const cameraOnline = isOnline(camera);

                    return (
                      <div
                        key={camera.id}
                        className="group overflow-hidden rounded-2xl border border-slate-800 bg-[#050914] transition hover:border-blue-500/20"
                      >
                        <div className="relative aspect-video overflow-hidden bg-black">
                          {liveStreamUrl && cameraOnline ? (
                            <>
                              <video
                                className="h-full w-full object-contain"
                                src={liveStreamUrl}
                                controls
                                autoPlay
                                muted
                                playsInline
                              >
                                Your browser does not support video playback.
                              </video>

                              <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-red-500/20 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300 backdrop-blur">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                                Live
                              </div>
                            </>
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-2xl">
                                ◉
                              </div>

                              <p className="mt-4 font-semibold text-white">
                                {camera.name}
                              </p>

                              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                {cameraOnline
                                  ? "Camera is online. Live video stream is not connected yet."
                                  : "Camera is currently offline."}
                              </p>

                              {cameraOnline && (
                                <div className="mt-4 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-yellow-400">
                                  LIVE STREAM NOT CONNECTED
                                </div>
                              )}
                            </div>
                          )}

                          {!cameraOnline && (
                            <div className="absolute left-4 top-4 rounded-full border border-red-500/20 bg-black/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300 backdrop-blur">
                              Offline
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {camera.name}
                            </p>

                            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                              <span>Location</span>
                              <span className="text-slate-700">•</span>
                              <span className="truncate">
                                {camera.location || "Not specified"}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                              cameraOnline
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : "border-red-500/20 bg-red-500/10 text-red-400"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                cameraOnline
                                  ? "bg-emerald-400"
                                  : "bg-red-400"
                              }`}
                            />
                            {cameraOnline ? "Online" : "Offline"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 rounded-2xl border border-blue-500/10 bg-blue-500/[0.03] p-4 sm:p-5">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    i
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-300">
                      CCTV architecture
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Live camera streams are delivered through the CCTV
                      streaming layer. Supabase Storage is used for saved
                      security event footage rather than the 24/7 live viewer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* PROTECTION CONTROL                                       */}
          {/* ========================================================= */}

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">

            {/* Main protection card */}
            <div
              className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${
                armed
                  ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-slate-900/90 to-slate-900/90"
                  : "border-slate-800 bg-slate-900/70"
              }`}
            >
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                        armed
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      🛡
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Protection Status
                      </p>

                      <h2 className="mt-2 text-2xl font-bold">
                        {armed ? "System Armed" : "System Disarmed"}
                      </h2>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                        {armed
                          ? "Your home is actively protected and security monitoring is enabled."
                          : "Security monitoring is currently disarmed. Arm the system when you want active protection."}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                      armed
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-700 bg-slate-800/80 text-slate-400"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        armed ? "bg-emerald-400" : "bg-slate-500"
                      }`}
                    />

                    {armed ? "Protected" : "Inactive"}
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-3 border-t border-slate-800/80 pt-6 sm:flex-row">
                  <form action={armSystem} className="flex-1 sm:flex-none">
                    <button
                      type="submit"
                      disabled={armed}
                      className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                    >
                      Arm System
                    </button>
                  </form>

                  <form action={disarmSystem} className="flex-1 sm:flex-none">
                    <button
                      type="submit"
                      disabled={!armed}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-bold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                    >
                      Disarm System
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Security health */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Security Health
              </p>

              <div className="mt-5 flex items-end justify-between">
                <p className="text-4xl font-bold">
                  {securityHealth}
                  <span className="text-lg text-slate-500">%</span>
                </p>

                <span className="mb-1 text-xs font-semibold text-slate-500">
                  Device availability
                </span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${securityHealth}%`,
                  }}
                />
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Online devices</span>
                  <span className="font-semibold text-slate-200">
                    {onlineDevices.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Total devices</span>
                  <span className="font-semibold text-slate-200">
                    {devices.length}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* DEVELOPMENT WEBCAM                                      */}
          {/* ========================================================= */}

          <section className="mt-8 rounded-3xl border border-dashed border-slate-700/80 bg-slate-900/40 p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-orange-400">
                    Development
                  </span>

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    Local camera test
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-bold">
                  Laptop Webcam Test
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  This development test uses the computer&apos;s built-in
                  webcam. It is separate from the production CCTV streaming
                  layer and does not identify the webcam as a permanent
                  security camera.
                </p>
              </div>
            </div>

            <div className="mt-6">
              {onlineCameras.length > 0 ? (
                <div className="space-y-5">
                  {onlineCameras.map((camera) => (
                    <div
                      key={camera.id}
                      className="overflow-hidden rounded-2xl border border-slate-800 bg-[#050914]"
                    >
                      <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">{camera.name}</p>

                          <p className="mt-1 text-xs text-slate-500">
                            {camera.location || "Location not specified"}
                          </p>
                        </div>

                        <span className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Online
                        </span>
                      </div>

                      <div className="p-3 sm:p-4">
                        <LiveCamera
                          cameraId={camera.id}
                          cameraName={camera.name}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-[#050914] p-6 text-center">
                  <p className="text-sm font-semibold text-slate-300">
                    No cameras are currently online.
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Connect or bring a camera online to start the local
                    development test.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ========================================================= */}
          {/* MONITORING SERVICES                                      */}
          {/* ========================================================= */}

          <section className="mt-8">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                Protection Layer
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Security Monitoring
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Current status of the home&apos;s primary monitoring systems.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Door Sensors
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    ✓
                  </span>
                </div>

                <p className="mt-5 text-lg font-bold">Active</p>

                <p className="mt-1 text-xs font-medium text-emerald-400">
                  Monitoring normally
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Window Sensors
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    ✓
                  </span>
                </div>

                <p className="mt-5 text-lg font-bold">Active</p>

                <p className="mt-1 text-xs font-medium text-emerald-400">
                  Monitoring normally
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Smoke Detection
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    ✓
                  </span>
                </div>

                <p className="mt-5 text-lg font-bold">Active</p>

                <p className="mt-1 text-xs font-medium text-emerald-400">
                  Monitoring normally
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cameras
                  </span>

                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      onlineCameras.length > 0
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    ◉
                  </span>
                </div>

                <p className="mt-5 text-lg font-bold">
                  {onlineCameras.length > 0 ? "Online" : "Offline"}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  {onlineCameras.length} camera
                  {onlineCameras.length === 1 ? "" : "s"} online
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* ACTIVE EVENTS                                            */}
          {/* ========================================================= */}

          <section className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
            <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">
                  Security Events
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Active Security Events
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Recent unresolved events requiring attention.
                </p>
              </div>

              <Link
                href="/alerts"
                className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >
                View all alerts →
              </Link>
            </div>

            <div className="p-5 sm:p-6">
              {activeAlerts.length === 0 ? (
                <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.04] p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                      ✓
                    </div>

                    <div>
                      <p className="font-semibold text-emerald-400">
                        No active security events
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Everything is currently operating normally.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="group rounded-2xl border border-slate-800 bg-[#080d19] p-4 transition hover:border-slate-700 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getSeverityClasses(
                                alert.severity
                              )}`}
                            >
                              {alert.severity || "low"}
                            </span>

                            <span className="text-xs text-slate-600">
                              Active
                            </span>
                          </div>

                          <p className="mt-3 font-semibold text-slate-100">
                            {alert.title}
                          </p>

                          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                            {alert.description}
                          </p>
                        </div>

                        <div className="shrink-0 text-left lg:text-right">
                          <p className="text-xs uppercase tracking-wider text-slate-600">
                            Detected
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {formatAlertTime(alert.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ========================================================= */}
          {/* SYSTEM INFORMATION                                       */}
          {/* ========================================================= */}

          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                  System Overview
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  System Information
                </h2>
              </div>

              <div className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-500">
                Live data
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-[#050914] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Connected Devices
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {devices.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#050914] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Devices Online
                </p>

                <p className="mt-3 text-3xl font-bold text-emerald-400">
                  {onlineDevices.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#050914] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Critical Events
                </p>

                <p
                  className={`mt-3 text-3xl font-bold ${
                    criticalAlerts.length > 0
                      ? "text-red-400"
                      : "text-slate-200"
                  }`}
                >
                  {criticalAlerts.length}
                </p>
              </div>
            </div>
          </section>

          {/* Footer spacing */}
          <div className="h-8" />
        </div>
      </main>
    </>
  );
}