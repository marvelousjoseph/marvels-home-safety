import DashboardNavbar from "@/components/DashboardNavbar";
import SecurityRealtime from "@/components/SecurityRealtime";
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

function isCamera(device: any) {
  return device.type?.toLowerCase().includes("camera");
}

function isOnline(device: any) {
  return device.status?.toLowerCase() === "online";
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
   * This is intentionally an environment variable rather than a fake
   * camera URL. When a real browser-compatible CCTV stream is connected,
   * it can be supplied through NEXT_PUBLIC_CCTV_STREAM_URL.
   *
   * Supported production approaches can include HLS or WebRTC.
   * Raw RTSP URLs should not be placed directly into a browser video tag.
   */
  const liveStreamUrl = process.env.NEXT_PUBLIC_CCTV_STREAM_URL ?? "";

  return (
    <>
      <SecurityRealtime />

      <DashboardNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-medium text-blue-400">
            MARVEL&apos;S HOME SAFETY
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Security Center
          </h1>

          <p className="mt-2 text-slate-400">
            Monitor your home, cameras, sensors, and security events.
          </p>
        </div>

        {/* 24/7 CCTV */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400">
                LIVE SECURITY
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                24/7 CCTV
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Live camera monitoring. Event recordings are stored separately
                for review in Alerts and Recordings.
              </p>
            </div>

            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                onlineCameras.length > 0
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              ● {onlineCameras.length} camera
              {onlineCameras.length === 1 ? "" : "s"} online
            </div>
          </div>

          {cameras.length === 0 ? (
            <div className="mt-6 flex min-h-[360px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950">
              <div className="text-center">
                <div className="text-5xl">📹</div>

                <h3 className="mt-4 text-lg font-semibold">
                  No CCTV cameras connected
                </h3>

                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Connect a camera device to your home to begin live CCTV
                  monitoring.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {cameras.map((camera) => {
                const cameraOnline = isOnline(camera);

                return (
                  <div
                    key={camera.id}
                    className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                  >
                    <div className="relative aspect-video bg-black">
                      {liveStreamUrl && cameraOnline ? (
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
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                          <div className="text-5xl">📹</div>

                          <p className="mt-4 text-lg font-semibold text-white">
                            {camera.name}
                          </p>

                          <p className="mt-2 text-sm text-slate-500">
                            {cameraOnline
                              ? "Camera is online. Live video stream is not connected yet."
                              : "Camera is currently offline."}
                          </p>

                          {cameraOnline && (
                            <div className="mt-4 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                              LIVE STREAM NOT CONNECTED
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold">
                          {camera.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {camera.location || "Location not specified"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          cameraOnline
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {cameraOnline ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-medium text-slate-300">
              CCTV architecture
            </p>

            <p className="mt-1 text-sm text-slate-500">
              The live camera stream is delivered directly through the CCTV
              streaming layer. Supabase Storage is used for saved security
              event footage, not as the 24/7 live camera viewer.
            </p>
          </div>
        </section>

        {/* Security Status */}
        <section
          className={`mt-8 rounded-2xl border p-8 ${
            armed
              ? "border-emerald-800 bg-emerald-950/30"
              : "border-slate-700 bg-slate-900"
          }`}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
                  armed ? "bg-emerald-500/20" : "bg-slate-800"
                }`}
              >
                🛡️
              </div>

              <div>
                <p className="text-sm font-medium text-slate-400">
                  SECURITY SYSTEM
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {armed ? "System Armed" : "System Disarmed"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {armed
                    ? "Your home is actively protected."
                    : "Security monitoring is currently disarmed."}
                </p>
              </div>
            </div>

            <div
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                armed
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {armed ? "● ARMED" : "● DISARMED"}
            </div>
          </div>
        </section>

        {/* Protection Controls */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">
            PROTECTION CONTROLS
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Security Mode
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Choose whether your home should be actively protected.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <form action={armSystem}>
              <button
                type="submit"
                disabled={armed}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Arm System
              </button>
            </form>

            <form action={disarmSystem}>
              <button
                type="submit"
                disabled={!armed}
                className="w-full rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Disarm System
              </button>
            </form>
          </div>
        </section>

        {/* Security Monitoring */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            Security Monitoring
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Door Sensors</p>
              <p className="mt-3 text-xl font-semibold">Active</p>
              <p className="mt-1 text-sm text-emerald-400">
                ✓ Monitoring
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Window Sensors</p>
              <p className="mt-3 text-xl font-semibold">Active</p>
              <p className="mt-1 text-sm text-emerald-400">
                ✓ Monitoring
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Smoke Detection</p>
              <p className="mt-3 text-xl font-semibold">Active</p>
              <p className="mt-1 text-sm text-emerald-400">
                ✓ Monitoring
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Cameras</p>
              <p className="mt-3 text-xl font-semibold">
                {onlineCameras.length > 0 ? "Online" : "Offline"}
              </p>
              <p className="mt-1 text-sm text-emerald-400">
                {onlineCameras.length} camera
                {onlineCameras.length === 1 ? "" : "s"} online
              </p>
            </div>
          </div>
        </section>

        {/* Active Security Events */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Active Security Events
            </h2>

            <a
              href="/alerts"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View all
            </a>
          </div>

          <div className="mt-5 space-y-4">
            {activeAlerts.length === 0 ? (
              <div className="rounded-xl bg-slate-800/60 p-5">
                <p className="font-medium text-emerald-400">
                  No active security events
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Everything is currently operating normally.
                </p>
              </div>
            ) : (
              activeAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl bg-slate-800/60 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            alert.severity?.toLowerCase() === "critical"
                              ? "bg-red-500/20 text-red-400"
                              : alert.severity?.toLowerCase() === "high"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {alert.severity?.toUpperCase()}
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
                      {new Date(alert.created_at).toLocaleString("en-NG")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* System Information */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            System Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-400">
                Connected Devices
              </p>

              <p className="mt-1 text-2xl font-bold">
                {devices.length}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Devices Online
              </p>

              <p className="mt-1 text-2xl font-bold">
                {onlineDevices.length}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Critical Events
              </p>

              <p className="mt-1 text-2xl font-bold">
                {criticalAlerts.length}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
