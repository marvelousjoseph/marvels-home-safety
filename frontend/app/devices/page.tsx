import DashboardNavbar from "@/components/DashboardNavbar";
import DevicesRealtime from "@/components/DevicesRealtime";
import CameraForm from "./camera-form";
import {
  simulateFrontDoorOpen,
  simulateCameraPersonDetection,
} from "./actions";
import { testCameraConnection } from "./camera-actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type CameraConnection = {
  device_id: string;
  ip_address: string;
  port: number;
  username: string | null;
  protocol: string;
  stream_path: string | null;
};

async function getDevices() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      devices: [],
      isAdmin: false,
    };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("home_members")
    .select("home_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.home_id) {
    return {
      devices: [],
      isAdmin: false,
    };
  }

  const isAdmin = membership.role === "admin";

  const { data: devices, error } = await supabase
    .from("devices")
    .select("*")
    .eq("home_id", membership.home_id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading devices:", error);

    return {
      devices: [],
      isAdmin,
    };
  }

  let cameraConnections: CameraConnection[] = [];

  if (isAdmin) {
    const { data, error: cameraError } = await supabase
      .from("camera_connections")
      .select(
        "device_id, ip_address, port, username, protocol, stream_path"
      )
      .eq("home_id", membership.home_id);

    if (cameraError) {
      console.error("Error loading camera connections:", cameraError);
    }

    cameraConnections = data ?? [];
  }

  const connectionsByDevice = new Map<string, CameraConnection>();

  for (const connection of cameraConnections) {
    connectionsByDevice.set(connection.device_id, connection);
  }

  return {
    devices: (devices ?? []).map((device) => ({
      ...device,
      cameraConnection: connectionsByDevice.get(device.id) ?? null,
    })),
    isAdmin,
  };
}

function getDeviceIcon(type: string | null, name: string | null) {
  const value = `${type ?? ""} ${name ?? ""}`.toLowerCase();

  if (value.includes("camera")) return "◉";
  if (value.includes("smoke")) return "!";
  if (value.includes("window")) return "□";
  if (value.includes("door")) return "⌂";

  return "•";
}

function getStatusStyle(status: string | null) {
  const value = status?.toLowerCase();

  if (value === "online") {
    return {
      dot: "bg-emerald-400",
      text: "text-emerald-300",
      badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      label: "ONLINE",
    };
  }

  if (value === "configured") {
    return {
      dot: "bg-blue-400",
      text: "text-blue-300",
      badge: "border-blue-500/20 bg-blue-500/10 text-blue-300",
      label: "CONFIGURED",
    };
  }

  return {
    dot: "bg-slate-500",
    text: "text-slate-400",
    badge: "border-slate-700 bg-slate-800/70 text-slate-400",
    label: "OFFLINE",
  };
}

function getDeviceCategory(type: string | null, name: string | null) {
  const value = `${type ?? ""} ${name ?? ""}`.toLowerCase();

  if (value.includes("camera")) return "CAMERA";
  if (value.includes("smoke")) return "SMOKE SENSOR";
  if (value.includes("window")) return "WINDOW SENSOR";
  if (value.includes("door")) return "DOOR SENSOR";

  return "SECURITY DEVICE";
}

export default async function DevicesPage() {
  const { devices, isAdmin } = await getDevices();

  const onlineDevices = devices.filter(
    (device) => device.status?.toLowerCase() === "online"
  );

  const offlineDevices = devices.filter(
    (device) =>
      device.status?.toLowerCase() !== "online" &&
      device.status?.toLowerCase() !== "configured"
  );

  const configuredDevices = devices.filter(
    (device) => device.status?.toLowerCase() === "configured"
  );

  const cameras = devices.filter(
    (device) =>
      device.type?.toLowerCase().includes("camera") ||
      device.name?.toLowerCase().includes("camera")
  );

  const onlineCameras = cameras.filter(
    (device) => device.status?.toLowerCase() === "online"
  );

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <DevicesRealtime />
      <DashboardNavbar />

      {/* Ambient lighting */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-80 w-80 rounded-full bg-blue-600/5 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Header */}
        <section>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
                <p className="text-xs font-bold tracking-[0.2em] text-blue-400">
                  DEVICE CONTROL
                </p>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Security Devices
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Monitor the sensors and cameras protecting your home in
                real time.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 shadow-xl shadow-black/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>

              <div>
                <p className="text-xs font-semibold text-white">
                  LIVE MONITORING
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Device status is updating
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-xl shadow-black/10 transition hover:border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-500">
                  TOTAL DEVICES
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {devices.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-800/70 text-lg text-slate-300">
                •
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Security equipment connected
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.035] p-5 shadow-xl shadow-black/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-500">
                  ONLINE
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-300">
                  {onlineDevices.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              </div>
            </div>

            <p className="mt-4 text-xs text-emerald-400/70">
              Operating normally
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.035] p-5 shadow-xl shadow-black/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-500">
                  CAMERAS
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-blue-300">
                  {onlineCameras.length}
                  <span className="ml-1 text-base font-medium text-slate-600">
                    / {cameras.length}
                  </span>
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                ◉
              </div>
            </div>

            <p className="mt-4 text-xs text-blue-400/70">
              Cameras currently online
            </p>
          </div>

          <div
            className={`rounded-2xl border p-5 shadow-xl shadow-black/10 ${
              offlineDevices.length === 0
                ? "border-emerald-500/15 bg-emerald-500/[0.025]"
                : "border-yellow-500/20 bg-yellow-500/[0.035]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-500">
                  OFFLINE
                </p>

                <p
                  className={`mt-3 text-3xl font-bold tracking-tight ${
                    offlineDevices.length === 0
                      ? "text-emerald-300"
                      : "text-yellow-300"
                  }`}
                >
                  {offlineDevices.length}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  offlineDevices.length === 0
                    ? "border border-emerald-500/20 bg-emerald-500/10"
                    : "border border-yellow-500/20 bg-yellow-500/10"
                }`}
              >
                {offlineDevices.length === 0 ? (
                  <span className="text-emerald-300">✓</span>
                ) : (
                  <span className="text-yellow-300">!</span>
                )}
              </div>
            </div>

            <p
              className={`mt-4 text-xs ${
                offlineDevices.length === 0
                  ? "text-emerald-400/70"
                  : "text-yellow-400/70"
              }`}
            >
              {offlineDevices.length === 0
                ? "All devices connected"
                : "Connection requires attention"}
            </p>
          </div>
        </section>

        {/* Devices */}
        {devices.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-10 text-center shadow-2xl shadow-black/10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/70 text-2xl text-slate-400">
              •
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No devices found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              No security devices are currently connected to your home.
            </p>
          </section>
        ) : (
          <section className="mt-10">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-blue-400">
                  PROTECTED HARDWARE
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Connected Devices
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current status and connection details for your security
                  equipment.
                </p>
              </div>

              <p className="text-xs text-slate-600">
                {devices.length} device{devices.length === 1 ? "" : "s"} registered
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {devices.map((device) => {
                const status = getStatusStyle(device.status);

                const isCamera =
                  device.type?.toLowerCase().includes("camera") ||
                  device.name?.toLowerCase().includes("camera");

                const isOnline =
                  device.status?.toLowerCase() === "online";

                return (
                  <article
                    key={device.id}
                    className="group overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/65 shadow-2xl shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900/85"
                  >
                    {/* Card accent */}
                    <div
                      className={`h-px w-full ${
                        isOnline
                          ? "bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
                          : "bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"
                      }`}
                    />

                    <div className="p-6">
                      {/* Identity */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-xl ${
                              isCamera
                                ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                                : "border-slate-700/80 bg-slate-800/70 text-slate-300"
                            }`}
                          >
                            {getDeviceIcon(
                              device.type,
                              device.name
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {device.name}
                            </p>

                            <p className="mt-1 text-[10px] font-bold tracking-[0.15em] text-slate-600">
                              {getDeviceCategory(
                                device.type,
                                device.name
                              )}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-wider ${status.badge}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-800/80 bg-[#050914]/80 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${status.dot} ${
                              isOnline
                                ? "shadow-[0_0_10px_rgba(52,211,153,0.55)]"
                                : ""
                            }`}
                          />

                          <div>
                            <p className="text-xs font-semibold text-slate-200">
                              {device.status || "Unknown"}
                            </p>

                            <p className="text-[10px] text-slate-600">
                              Device connection
                            </p>
                          </div>
                        </div>

                        <span className={`text-xs font-medium ${status.text}`}>
                          {isOnline ? "Healthy" : status.label}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="mt-5 border-t border-slate-800/80 pt-5">
                        <p className="text-[9px] font-bold tracking-[0.18em] text-slate-600">
                          LOCATION
                        </p>

                        <p className="mt-1.5 text-sm text-slate-300">
                          {device.location || "Location not specified"}
                        </p>
                      </div>

                      {/* Camera connection */}
                      {isAdmin && isCamera && device.cameraConnection && (
                        <div className="mt-5 border-t border-slate-800/80 pt-5">
                          <div className="flex items-center justify-between">
                            <p className="text-[9px] font-bold tracking-[0.18em] text-slate-600">
                              CAMERA CONNECTION
                            </p>

                            <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-300">
                              {device.cameraConnection.protocol}
                            </span>
                          </div>

                          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-800/80 bg-[#050914]/80">
                            <div className="divide-y divide-slate-800/70">
                              <div className="flex items-center justify-between gap-4 px-4 py-3">
                                <span className="text-xs text-slate-600">
                                  Address
                                </span>

                                <span className="max-w-[180px] truncate font-mono text-[11px] text-slate-300">
                                  {device.cameraConnection.ip_address}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-4 px-4 py-3">
                                <span className="text-xs text-slate-600">
                                  Port
                                </span>

                                <span className="font-mono text-[11px] text-slate-300">
                                  {device.cameraConnection.port}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-4 px-4 py-3">
                                <span className="text-xs text-slate-600">
                                  Username
                                </span>

                                <span className="max-w-[150px] truncate font-mono text-[11px] text-slate-300">
                                  {device.cameraConnection.username ||
                                    "Not set"}
                                </span>
                              </div>

                              {device.cameraConnection.stream_path && (
                                <div className="flex items-center justify-between gap-4 px-4 py-3">
                                  <span className="text-xs text-slate-600">
                                    Stream
                                  </span>

                                  <span className="max-w-[150px] truncate font-mono text-[11px] text-slate-300">
                                    {device.cameraConnection.stream_path}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <form
                            action={async () => {
                              "use server";

                              await testCameraConnection(device.id);
                            }}
                            className="mt-3"
                          >
                            <button
                              type="submit"
                              className="w-full rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs font-semibold text-blue-300 transition hover:border-blue-400/30 hover:bg-blue-500/15 active:scale-[0.99]"
                            >
                              Test Camera Connection
                            </button>
                          </form>

                          <p className="mt-2 text-center text-[10px] leading-5 text-slate-600">
                            {device.cameraConnection.protocol === "rtsp"
                              ? "RTSP testing will be handled by the future Marvels home-network gateway."
                              : "HTTP/HTTPS connection test runs from the Marvels server."}
                          </p>
                        </div>
                      )}

                      {/* Development controls */}
                      {isAdmin &&
                        (device.name === "Front Door Sensor" || isCamera) && (
                          <div className="mt-5 border-t border-slate-800/80 pt-5">
                            <div className="mb-3 flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />

                              <p className="text-[9px] font-bold tracking-[0.18em] text-orange-300/80">
                                DEVELOPMENT TESTING
                              </p>
                            </div>

                            {device.name === "Front Door Sensor" && (
                              <>
                                <form action={simulateFrontDoorOpen}>
                                  <button
                                    type="submit"
                                    className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-blue-500 active:scale-[0.99]"
                                  >
                                    Simulate Door Open
                                  </button>
                                </form>

                                <p className="mt-2 text-center text-[10px] text-slate-600">
                                  Creates a real device event in Supabase.
                                </p>
                              </>
                            )}

                            {isCamera && (
                              <form
                                action={async () => {
                                  "use server";

                                  await simulateCameraPersonDetection(
                                    device.id
                                  );
                                }}
                                className={
                                  device.name === "Front Door Sensor"
                                    ? "mt-3"
                                    : ""
                                }
                              >
                                <button
                                  type="submit"
                                  className="w-full rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-xs font-semibold text-purple-300 transition hover:border-purple-400/30 hover:bg-purple-500/15 active:scale-[0.99]"
                                >
                                  Simulate Person Detection
                                </button>
                              </form>
                            )}

                            {isCamera && (
                              <p className="mt-2 text-center text-[10px] text-slate-600">
                                Development testing only.
                              </p>
                            )}
                          </div>
                        )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Add Camera */}
        {isAdmin && (
          <section className="mt-10">
            <CameraForm />
          </section>
        )}

        {/* Development information */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-blue-500/15 bg-blue-500/[0.035] shadow-2xl shadow-black/10">
          <div className="flex items-start gap-4 p-6 sm:p-7">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
              i
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-blue-400">
                DEVELOPMENT ENVIRONMENT
              </p>

              <h2 className="mt-1 font-semibold text-blue-200">
                Device testing is connected to the real security pipeline
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                The Front Door Sensor simulation creates a real device
                event in Supabase. When the security system is armed,
                the event can also produce a high-severity security
                alert.
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                Activity, Alerts, Dashboard, and Security pages use the
                same underlying Supabase data.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}