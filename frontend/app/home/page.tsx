import DashboardNavbar from "@/components/DashboardNavbar";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      home: null,
      members: [],
      devices: [],
      userRole: null,
    };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("home_members")
    .select("home_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.home_id) {
    console.error("Home membership error:", membershipError);

    return {
      home: null,
      members: [],
      devices: [],
      userRole: null,
    };
  }

  const homeId = membership.home_id;

  const [{ data: home }, { data: members }, { data: devices }] =
    await Promise.all([
      supabase
        .from("homes")
        .select("id, name, created_at")
        .eq("id", homeId)
        .maybeSingle(),

      supabase
        .from("home_members")
        .select("id, user_id, role, created_at")
        .eq("home_id", homeId)
        .order("created_at", { ascending: true }),

      supabase
        .from("devices")
        .select("*")
        .eq("home_id", homeId)
        .order("name", { ascending: true }),
    ]);

  return {
    home,
    members: members ?? [],
    devices: devices ?? [],
    userRole: membership.role,
  };
}

function getDeviceIcon(type: string | null, name: string | null) {
  const value = `${type ?? ""} ${name ?? ""}`.toLowerCase();

  if (value.includes("camera")) return "📹";
  if (value.includes("door")) return "🚪";
  if (value.includes("window")) return "🪟";
  if (value.includes("smoke")) return "🔥";
  if (value.includes("sensor")) return "📡";

  return "🛡️";
}

export default async function HomePage() {
  const { home, members, devices, userRole } = await getHomeData();

  const onlineDevices = devices.filter(
    (device) => device.status?.toLowerCase() === "online"
  );

  const offlineDevices = devices.filter(
    (device) => device.status?.toLowerCase() !== "online"
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-semibold tracking-wider text-blue-400">
            MARVEL&apos;S HOME SAFETY
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Home Management
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your home, members, and connected security devices.
          </p>
        </div>

        {!home ? (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                🏠
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  No home found
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Your account is not currently connected to a home.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* HOME HEADER */}
            <section className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40">
              <div className="p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-600/20 text-4xl ring-1 ring-blue-500/20">
                      🏠
                    </div>

                    <div>
                      <p className="text-sm font-medium uppercase tracking-wider text-blue-400">
                        Your Home
                      </p>

                      <h2 className="mt-1 text-3xl font-bold">
                        {home.name}
                      </h2>

                      <p className="mt-2 text-sm text-slate-400">
                        Your connected home security environment.
                      </p>
                    </div>
                  </div>

                  <div className="w-fit rounded-2xl border border-blue-800/60 bg-blue-950/40 px-6 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                      Your Role
                    </p>

                    <p className="mt-1 text-lg font-bold capitalize">
                      {userRole || "Member"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* STATISTICS */}
            <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Home
                  </p>

                  <span className="text-2xl">🏠</span>
                </div>

                <p className="mt-4 text-xl font-bold">
                  {home.name}
                </p>

                <p className="mt-2 text-sm text-emerald-400">
                  ✓ Connected
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Home Members
                  </p>

                  <span className="text-2xl">👥</span>
                </div>

                <p className="mt-4 text-3xl font-bold">
                  {members.length}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Connected members
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Devices
                  </p>

                  <span className="text-2xl">📡</span>
                </div>

                <p className="mt-4 text-3xl font-bold">
                  {devices.length}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Connected devices
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Devices Online
                  </p>

                  <span className="text-2xl">🟢</span>
                </div>

                <p className="mt-4 text-3xl font-bold">
                  {onlineDevices.length}
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
                    ? `${onlineDevices.length} of ${devices.length} online`
                    : "No devices"}
                </p>
              </div>
            </section>

            {/* MEMBERS */}
            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Home Members
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    People connected to this home.
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                  👥
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {members.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                    <p className="font-medium">
                      No members found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      There are currently no members connected to this home.
                    </p>
                  </div>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-lg">
                          👤
                        </div>

                        <div>
                          <p className="font-medium">
                            Home Member
                          </p>

                          <p className="mt-1 max-w-[280px] truncate text-xs text-slate-500">
                            User ID: {member.user_id}
                          </p>
                        </div>
                      </div>

                      <span className="w-fit rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold capitalize text-blue-400">
                        {member.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* DEVICES */}
            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Connected Devices
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Security devices connected to your home.
                  </p>
                </div>

                <a
                  href="/devices"
                  className="w-fit rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-blue-400 transition hover:bg-slate-800 hover:text-blue-300"
                >
                  Manage devices →
                </a>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {devices.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 sm:col-span-2 lg:col-span-4">
                    <p className="font-medium">
                      No devices connected
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Add a security device to protect your home.
                    </p>
                  </div>
                ) : (
                  devices.map((device) => {
                    const isOnline =
                      device.status?.toLowerCase() === "online";

                    return (
                      <div
                        key={device.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-slate-700"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl">
                              {getDeviceIcon(
                                device.type,
                                device.name
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold">
                                {device.name}
                              </p>

                              <p className="mt-1 text-sm text-slate-400">
                                {device.type || "Security device"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`h-3 w-3 shrink-0 rounded-full ${
                              isOnline
                                ? "bg-emerald-400 shadow-lg shadow-emerald-400/30"
                                : "bg-slate-600"
                            }`}
                          />
                        </div>

                        <div className="mt-5 border-t border-slate-800 pt-4">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-500">
                              STATUS
                            </p>

                            <p
                              className={`text-sm font-semibold ${
                                isOnline
                                  ? "text-emerald-400"
                                  : "text-slate-400"
                              }`}
                            >
                              {device.status || "Unknown"}
                            </p>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-500">
                              LOCATION
                            </p>

                            <p className="mt-1 text-sm text-slate-300">
                              {device.location || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* DEVICE HEALTH */}
            <section className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
                    ✓
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">
                      Online Devices
                    </p>

                    <p className="mt-1 text-2xl font-bold text-emerald-400">
                      {onlineDevices.length}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  Devices currently connected and reporting their status.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-xl">
                    ⚠️
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">
                      Offline Devices
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {offlineDevices.length}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  Devices that are currently not reporting an online status.
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
