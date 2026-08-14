import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getSecurityEvent(eventId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("home_members")
    .select("home_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.home_id) {
    return null;
  }

  const homeId = membership.home_id;

  const { data: event, error: eventError } = await supabase
    .from("device_events")
    .select(`
      id,
      home_id,
      device_id,
      event_type,
      description,
      created_at,
      devices (
        id,
        name,
        type,
        location,
        status
      )
    `)
    .eq("id", eventId)
    .eq("home_id", homeId)
    .maybeSingle();

  if (eventError) {
    console.error("Security event loading error:", eventError);
    return null;
  }

  if (!event) {
    return null;
  }

  const { data: recording, error: recordingError } = await supabase
    .from("security_event_recordings")
    .select(`
      id,
      alert_id,
      camera_id,
      storage_path,
      video_url,
      thumbnail_url,
      started_at,
      ended_at,
      status,
      created_at
    `)
    .eq("device_event_id", event.id)
    .eq("home_id", homeId)
    .limit(1)
    .maybeSingle();

  if (recordingError) {
    console.error("Recording loading error:", recordingError);
  }

  let alert = null;

  if (recording?.alert_id) {
    const { data: alertData, error: alertError } = await supabase
      .from("alerts")
      .select(`
        id,
        title,
        description,
        severity,
        resolved,
        created_at
      `)
      .eq("id", recording.alert_id)
      .eq("home_id", homeId)
      .maybeSingle();

    if (alertError) {
      console.error("Alert loading error:", alertError);
    }

    alert = alertData ?? null;
  }

  const { data: securityStatus, error: securityError } = await supabase
    .from("security_status")
    .select("armed, updated_at")
    .eq("home_id", homeId)
    .maybeSingle();

  if (securityError) {
    console.error("Security status loading error:", securityError);
  }

  return {
    event,
    recording,
    alert,
    securityStatus,
  };
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatEventType(value: string | null) {
  if (!value) {
    return "Security Event";
  }

  return value.replaceAll("_", " ").replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );
}

function getSeverityStyle(severity: string | null) {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "bg-red-500/20 text-red-400 border-red-900";

    case "high":
      return "bg-orange-500/20 text-orange-400 border-orange-900";

    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-900";

    default:
      return "bg-blue-500/20 text-blue-400 border-blue-900";
  }
}

export default async function SecurityEventPage({
  params,
}: PageProps) {
  const { id } = await params;

  const data = await getSecurityEvent(id);

  if (!data) {
    notFound();
  }

  const { event, recording, alert, securityStatus } = data;

  const device = Array.isArray(event.devices)
    ? event.devices[0]
    : event.devices;

  const severity = alert?.severity ?? "low";

  const recordingStatus =
    recording?.status?.toLowerCase() ?? "not available";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <DashboardNavbar />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/alerts"
          className="text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          ← Back to Alerts
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-blue-400">
            MARVEL&apos;S HOME SAFETY
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Security Event
          </h1>

          <p className="mt-2 text-slate-400">
            Review the details of this security event.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getSeverityStyle(
                    severity
                  )}`}
                >
                  {severity.toUpperCase()}
                </span>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                  {alert?.resolved ? "RESOLVED" : "ACTIVE"}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-semibold">
                {alert?.title || formatEventType(event.event_type)}
              </h2>

              <p className="mt-2 leading-7 text-slate-400">
                {event.description}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              Event Information
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Event Type
                </p>

                <p className="mt-1 font-medium">
                  {formatEventType(event.event_type)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Detected
                </p>

                <p className="mt-1 font-medium">
                  {formatDate(event.created_at)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Event ID
                </p>

                <p className="mt-1 break-all font-mono text-xs text-slate-400">
                  {event.id}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              Device
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Device
                </p>

                <p className="mt-1 font-medium">
                  {device?.name || "Unknown device"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Type
                </p>

                <p className="mt-1 font-medium">
                  {device?.type || "Unknown"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Location
                </p>

                <p className="mt-1 font-medium">
                  {device?.location || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Device Status
                </p>

                <p className="mt-1 font-medium">
                  {device?.status || "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">
            Security Status
          </h2>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Home protection status
              </p>

              <p
                className={`mt-1 text-xl font-semibold ${
                  securityStatus?.armed
                    ? "text-emerald-400"
                    : "text-slate-300"
                }`}
              >
                {securityStatus?.armed
                  ? "System Armed"
                  : "System Disarmed"}
              </p>
            </div>

            <p className="text-sm text-slate-500">
              Last updated:{" "}
              {formatDate(securityStatus?.updated_at ?? null)}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Security Recording
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                CCTV recording associated with this security event.
              </p>
            </div>

            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase text-slate-300">
              {recordingStatus}
            </span>
          </div>

          {recording ? (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5">
              {recordingStatus === "pending" ? (
                <>
                  <p className="font-medium text-blue-400">
                    Recording is being prepared
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    The security event has been linked to the appropriate
                    recording source. CCTV footage will become available
                    when video integration is connected.
                  </p>
                </>
              ) : recording.video_url ? (
                <>
                  <p className="font-medium text-emerald-400">
                    Recording available
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Video playback will be available through the CCTV
                    interface.
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-400">
                  A recording record exists, but video footage is not
                  currently available.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="font-medium">
                No recording attached
              </p>

              <p className="mt-2 text-sm text-slate-400">
                No camera recording was associated with this event.
              </p>
            </div>
          )}
        </section>

        {alert && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              Alert Information
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Alert
                </p>

                <p className="mt-1 font-medium">
                  {alert.title}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Description
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {alert.description}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Created
                </p>

                <p className="mt-1 font-medium">
                  {formatDate(alert.created_at)}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
