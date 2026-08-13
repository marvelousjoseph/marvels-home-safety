import DashboardNavbar from "@/components/DashboardNavbar";
import ActivityRealtime from "@/components/ActivityRealtime";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function getActivity() {
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
    .eq("home_id", membership.home_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error loading activity:", error);
    return [];
  }

  return data ?? [];
}

function formatEventTime(createdAt: string | null) {
  if (!createdAt) {
    return "Unknown time";
  }

  const created = new Date(createdAt);
  const now = new Date();

  const difference = now.getTime() - created.getTime();
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) {
    return "Just now";
  }

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

  if (type.includes("door")) {
    return "🚪";
  }

  if (type.includes("window")) {
    return "🪟";
  }

  if (type.includes("smoke")) {
    return "🔥";
  }

  if (type.includes("camera")) {
    return "📹";
  }

  return "📡";
}

export default async function ActivityPage() {
  const events = await getActivity();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <ActivityRealtime />
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-medium text-blue-400">
          MARVEL&apos;S HOME SAFETY
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Security Activity
        </h1>

        <p className="mt-2 text-slate-400">
          Review the recent activity recorded by your home security devices.
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Live activity updates enabled
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Recent Device Events
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {events.length} event{events.length === 1 ? "" : "s"} recorded
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {events.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <p className="font-medium">
                  No activity recorded
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Device activity will appear here when your security devices
                  report events.
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
                    className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl">
                          {getEventIcon(event.event_type)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="font-semibold">
                              {device?.name || "Security Device"}
                            </p>

                            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                              {event.event_type?.replaceAll("_", " ").toUpperCase()}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-400">
                            {event.description}
                          </p>

                          {device?.location && (
                            <p className="mt-2 text-xs text-slate-500">
                              Location: {device.location}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="shrink-0 text-sm text-slate-500">
                        {formatEventTime(event.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
