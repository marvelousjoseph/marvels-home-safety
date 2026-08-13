import DashboardNavbar from "@/components/DashboardNavbar";
import DevicesRealtime from "@/components/DevicesRealtime";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { simulateFrontDoorOpen } from "./actions";

export const dynamic = "force-dynamic";

async function getDevices() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: membership, error: membershipError } = await supabase
    .from("home_members")
    .select("home_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.home_id) {
    return [];
  }

  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("home_id", membership.home_id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading devices:", error);
    return [];
  }

  return data ?? [];
}

function getDeviceIcon(type: string | null, name: string | null) {
  const value = `${type ?? ""} ${name ?? ""}`.toLowerCase();

  if (value.includes("camera")) {
    return "📹";
  }

  if (value.includes("smoke")) {
    return "🔥";
  }

  if (value.includes("window")) {
    return "🪟";
  }

  if (value.includes("door")) {
    return "🚪";
  }

  return "📡";
}

export default async function DevicesPage() {
  const devices = await getDevices();

  const onlineDevices = devices.filter(
    (device) => device.status?.toLowerCase() === "online"
  );

  const offlineDevices = devices.filter(
    (device) => device.status?.toLowerCase() !== "online"
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <DevicesRealtime />
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <section>
          <p className="text-sm font-semibold tracking-wider text-blue-400">
            MARVEL&apos;S HOME SAFETY
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Security Devices
              </h1>

              <p className="mt-2 text-slate-400">
                Monitor the devices protecting your home.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              LIVE DEVICE MONITORING
            </div>
          </div>
        </section>

        {/* Device Statistics */}
        <section className="mt-8 grid gap-5 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Total Devices
            </p>

            <p className="mt-3 text-3xl font-bold">
              {devices.length}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Connected to your home
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <p className="text-sm text-slate-400">
              Online
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-400">
              {onlineDevices.length}
            </p>

            <p className="mt-2 text-sm text-emerald-400">
              Devices operating normally
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Offline
            </p>

            <p className="mt-3 text-3xl font-bold">
              {offlineDevices.length}
            </p>

            <p
              className={`mt-2 text-sm ${
                offlineDevices.length === 0
                  ? "text-emerald-400"
                  : "text-yellow-400"
              }`}
            >
              {offlineDevices.length === 0
                ? "All devices connected"
                : "Check device connection"}
            </p>
          </div>

        </section>

        {/* Devices */}
        {devices.length === 0 ? (

          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
              📡
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No devices found
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              No security devices are currently connected to your home.
            </p>
          </section>

        ) : (

          <section className="mt-8">

            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Connected Devices
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Live status of your home security equipment.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {devices.map((device) => {
                const isOnline =
                  device.status?.toLowerCase() === "online";

                return (
                  <div
                    key={device.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
                  >

                    {/* Device Header */}
                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl">
                          {getDeviceIcon(
                            device.type,
                            device.name
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {device.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {device.type || "Security device"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Status */}
                    <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-950 p-3">

                      <div className="flex items-center gap-2">

                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            isOnline
                              ? "bg-emerald-400"
                              : "bg-slate-600"
                          }`}
                        />

                        <span className="text-sm font-medium">
                          {device.status || "Unknown"}
                        </span>

                      </div>

                      <span
                        className={`text-xs font-semibold ${
                          isOnline
                            ? "text-emerald-400"
                            : "text-slate-500"
                        }`}
                      >
                        {isOnline ? "CONNECTED" : "OFFLINE"}
                      </span>

                    </div>

                    {/* Location */}
                    <div className="mt-5 border-t border-slate-800 pt-4">

                      <p className="text-[10px] font-bold tracking-wider text-slate-500">
                        LOCATION
                      </p>

                      <p className="mt-1 text-sm text-slate-300">
                        {device.location || "Location not specified"}
                      </p>

                    </div>

                    {/* Front Door Testing */}
                    {device.name === "Front Door Sensor" && (
                      <div className="mt-5 border-t border-slate-800 pt-5">

                        <form action={simulateFrontDoorOpen}>
                          <button
                            type="submit"
                            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 active:scale-[0.98]"
                          >
                            🚪 Simulate Door Open
                          </button>
                        </form>

                        <p className="mt-2 text-center text-xs text-slate-500">
                          Development testing only
                        </p>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          </section>

        )}

        {/* Development Testing Explanation */}
        <section className="mt-8 rounded-2xl border border-blue-900/50 bg-blue-950/20 p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
              ℹ️
            </div>

            <div>
              <h2 className="font-semibold text-blue-300">
                Development Testing
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                The Front Door Sensor simulation creates a real device event
                in Supabase. If your security system is armed, it also creates
                a high-severity security alert.
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Activity, Alerts, Dashboard, and Security pages update from
                the same Supabase data.
              </p>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
