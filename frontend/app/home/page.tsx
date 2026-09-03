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

function getDeviceCode(type: string | null, name: string | null) {
  const value = `${type ?? ""} ${name ?? ""}`.toLowerCase();

  if (value.includes("camera") || value.includes("cctv")) return "CAM";
  if (value.includes("door")) return "DR";
  if (value.includes("window")) return "WIN";
  if (value.includes("smoke")) return "SMK";
  if (value.includes("sensor")) return "SNS";

  return "DEV";
}

export default async function HomePage() {
  const { home, members, devices, userRole } = await getHomeData();

  const onlineDevices = devices.filter(
    (device) => device.status?.toLowerCase() === "online"
  );

  const offlineDevices = devices.filter(
    (device) => device.status?.toLowerCase() !== "online"
  );

  const allDevicesOnline =
    devices.length > 0 && onlineDevices.length === devices.length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <DashboardNavbar />

      <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-7 lg:px-9 lg:py-8">
        {/* Command Header */}
        <header className="border-b border-slate-800/80 pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 bg-blue-400" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-400">
                  Home Management
                </p>
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Home
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Manage your home, members and connected security infrastructure.
              </p>
            </div>

            {home && (
              <div className="flex items-center gap-4 self-start border border-slate-800 bg-slate-950/60 px-4 py-3 lg:self-auto">
                <span
                  className={`h-2 w-2 ${
                    allDevicesOnline
                      ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]"
                      : devices.length === 0
                        ? "bg-slate-600"
                        : "bg-yellow-400"
                  }`}
                />

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Infrastructure
                  </p>

                  <p
                    className={`mt-0.5 text-xs font-semibold ${
                      allDevicesOnline
                        ? "text-emerald-400"
                        : devices.length === 0
                          ? "text-slate-500"
                          : "text-yellow-400"
                    }`}
                  >
                    {allDevicesOnline
                      ? "ALL SYSTEMS ONLINE"
                      : devices.length === 0
                        ? "NO DEVICES"
                        : "ATTENTION REQUIRED"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {!home ? (
          <section className="mt-6 border border-slate-800/80 bg-[#020811]">
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-500">
                HM
              </div>

              <h2 className="mt-4 text-base font-semibold">
                No home found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Your account is not currently connected to a home.
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* Home Identity */}
            <section className="mt-6 border border-slate-800/80 bg-[#020811]">
              <div className="flex flex-col gap-6 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-blue-500/20 bg-blue-500/[0.06] text-[11px] font-bold tracking-wider text-blue-400">
                    HM
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                      Connected Home
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      {home.name}
                    </h2>

                    <p className="mt-1 text-xs text-slate-600">
                      Home security environment
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 border border-slate-800/80 bg-slate-950/40 sm:grid-cols-3">
                  <div className="border-r border-slate-800/80 px-5 py-3">
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Role
                    </p>

                    <p className="mt-1 text-xs font-semibold capitalize text-blue-400">
                      {userRole || "Member"}
                    </p>
                  </div>

                  <div className="border-r border-slate-800/80 px-5 py-3">
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Members
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {members.length}
                    </p>
                  </div>

                  <div className="col-span-2 px-5 py-3 sm:col-span-1">
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Devices
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {devices.length}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Operational Metrics */}
            <section className="mt-5 grid border border-slate-800/80 bg-slate-950/40 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-b border-slate-800/80 p-5 sm:border-r lg:border-b-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Home
                </p>

                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="truncate text-sm font-semibold">
                    {home.name}
                  </p>

                  <span className="text-[10px] font-medium text-emerald-400">
                    Connected
                  </span>
                </div>
              </div>

              <div className="border-b border-slate-800/80 p-5 lg:border-b-0 lg:border-r">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Home Members
                </p>

                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-2xl font-semibold">
                    {members.length}
                  </p>

                  <span className="text-[10px] font-medium text-slate-500">
                    Connected
                  </span>
                </div>
              </div>

              <div className="border-b border-slate-800/80 p-5 sm:border-r lg:border-b-0">
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

              <div className="p-5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Device Health
                </p>

                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-2xl font-semibold">
                    {onlineDevices.length}
                  </p>

                  <span
                    className={`text-[10px] font-medium ${
                      allDevicesOnline
                        ? "text-emerald-400"
                        : devices.length === 0
                          ? "text-slate-500"
                          : "text-yellow-400"
                    }`}
                  >
                    {devices.length === 0
                      ? "No devices"
                      : `${onlineDevices.length}/${devices.length} online`}
                  </span>
                </div>
              </div>
            </section>

            {/* Members + Home Information */}
            <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
              {/* Members */}
              <div className="border border-slate-800/80 bg-[#020811]">
                <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
                  <div>
                    <h2 className="text-sm font-semibold">
                      Home Members
                    </h2>

                    <p className="mt-1 text-[11px] text-slate-600">
                      People connected to this home.
                    </p>
                  </div>

                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    {members.length} {members.length === 1 ? "Member" : "Members"}
                  </span>
                </div>

                <div className="divide-y divide-slate-800/70">
                  {members.length === 0 ? (
                    <div className="px-5 py-8">
                      <p className="text-sm font-medium">
                        No members found
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        There are currently no members connected to this home.
                      </p>
                    </div>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-900/40"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-800 bg-slate-950 text-[10px] font-semibold text-blue-400">
                            HM
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-300">
                              Home Member
                            </p>

                            <p className="mt-1 text-[10px] text-slate-600">
                              Connected member
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-blue-400">
                          {member.role || "Member"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Home Information */}
              <div className="border border-slate-800/80 bg-[#020811]">
                <div className="border-b border-slate-800/80 px-5 py-4">
                  <h2 className="text-sm font-semibold">
                    Home Information
                  </h2>

                  <p className="mt-1 text-[11px] text-slate-600">
                    Current home configuration.
                  </p>
                </div>

                <div className="divide-y divide-slate-800/70">
                  <div className="px-5 py-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Home Name
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-300">
                      {home.name}
                    </p>
                  </div>

                  <div className="px-5 py-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Access Role
                    </p>

                    <p className="mt-1 text-sm font-medium capitalize text-blue-400">
                      {userRole || "Member"}
                    </p>
                  </div>

                  <div className="px-5 py-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Infrastructure
                    </p>

                    <p
                      className={`mt-1 text-sm font-medium ${
                        allDevicesOnline
                          ? "text-emerald-400"
                          : devices.length === 0
                            ? "text-slate-500"
                            : "text-yellow-400"
                      }`}
                    >
                      {allDevicesOnline
                        ? "All devices online"
                        : devices.length === 0
                          ? "No devices connected"
                          : `${offlineDevices.length} device${
                              offlineDevices.length === 1 ? "" : "s"
                            } require attention`}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Connected Devices */}
            <section className="mt-6 border border-slate-800/80 bg-[#020811]">
              <div className="flex flex-col gap-4 border-b border-slate-800/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold">
                    Connected Devices
                  </h2>

                  <p className="mt-1 text-[11px] text-slate-600">
                    Security devices connected to your home.
                  </p>
                </div>

                <a
                  href="/devices"
                  className="w-fit text-[10px] font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-300"
                >
                  Manage devices
                </a>
              </div>

              <div className="divide-y divide-slate-800/70">
                {devices.length === 0 ? (
                  <div className="px-5 py-8">
                    <p className="text-sm font-medium">
                      No devices connected
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
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
                        className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-10 shrink-0 items-center justify-center border border-slate-800 bg-slate-950 text-[8px] font-bold tracking-wider text-slate-500">
                            {getDeviceCode(device.type, device.name)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-slate-300">
                              {device.name}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-slate-600">
                              {device.type || "Security device"}
                              {device.location
                                ? ` · ${device.location}`
                                : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-5 sm:shrink-0">
                          <div className="text-right">
                            <p className="text-[9px] uppercase tracking-wider text-slate-600">
                              Status
                            </p>

                            <p
                              className={`mt-1 text-[10px] font-semibold uppercase tracking-wider ${
                                isOnline
                                  ? "text-emerald-400"
                                  : "text-slate-500"
                              }`}
                            >
                              {device.status || "Unknown"}
                            </p>
                          </div>

                          <span
                            className={`h-1.5 w-1.5 shrink-0 ${
                              isOnline
                                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                : "bg-slate-600"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Device Health */}
            <section className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="border border-emerald-900/50 bg-emerald-950/[0.08]">
                <div className="flex items-center justify-between px-5 py-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Online Devices
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-emerald-400">
                      {onlineDevices.length}
                    </p>
                  </div>

                  <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                    Operational
                  </span>
                </div>

                <div className="border-t border-emerald-900/40 px-5 py-4">
                  <p className="text-xs leading-5 text-slate-600">
                    Devices currently connected and reporting their status.
                  </p>
                </div>
              </div>

              <div className="border border-slate-800/80 bg-[#020811]">
                <div className="flex items-center justify-between px-5 py-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Offline Devices
                    </p>

                    <p
                      className={`mt-1 text-2xl font-semibold ${
                        offlineDevices.length > 0
                          ? "text-yellow-400"
                          : "text-slate-300"
                      }`}
                    >
                      {offlineDevices.length}
                    </p>
                  </div>

                  <span
                    className={`text-[9px] font-semibold uppercase tracking-wider ${
                      offlineDevices.length > 0
                        ? "text-yellow-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {offlineDevices.length > 0 ? "Review" : "Clear"}
                  </span>
                </div>

                <div className="border-t border-slate-800/70 px-5 py-4">
                  <p className="text-xs leading-5 text-slate-600">
                    Devices that are currently not reporting an online status.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
