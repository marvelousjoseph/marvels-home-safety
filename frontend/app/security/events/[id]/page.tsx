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

type Camera = {
  id: string;
  name: string;
  type: string;
  location: string | null;
  status: string | null;
};

async function getSecurityEvent(eventId: string) {
  const supabase = await createSupabaseServerClient();

  /*
   * Authenticate the current user.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * Determine the authenticated user's home.
   */
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

  /*
   * Load the security event.
   *
   * The home_id condition prevents a user from opening
   * another home's security event by changing the URL.
   */
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

  /*
   * Find the CCTV recording created for this exact event.
   */
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

  /*
   * Load the alert associated with this event recording.
   */
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

  /*
   * Load the camera responsible for the recording.
   *
   * camera_id comes from security_event_recordings and therefore
   * identifies the exact camera assigned to this security event.
   */
  let recordingCamera: Camera | null = null;

  if (recording?.camera_id) {
    const { data: cameraData, error: cameraError } = await supabase
      .from("devices")
      .select(`
        id,
        name,
        type,
        location,
        status
      `)
      .eq("id", recording.camera_id)
      .eq("home_id", homeId)
      .maybeSingle();

    if (cameraError) {
      console.error(
        "Recording camera loading error:",
        cameraError
      );
    }

    recordingCamera = cameraData ?? null;
  }

  /*
   * Generate a temporary signed URL for the PRIVATE
   * security-recordings bucket.
   *
   * Never expose the raw Storage path as a public URL.
   */
  let signedVideoUrl: string | null = null;

  const storagePath =
    recording?.storage_path || recording?.video_url || null;

  if (
    recording &&
    recording.status?.toLowerCase() === "ready" &&
    storagePath
  ) {
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("security-recordings")
        .createSignedUrl(storagePath, 60 * 60);

    if (signedUrlError) {
      console.error(
        "Security recording signed URL error:",
        signedUrlError
      );
    } else {
      signedVideoUrl = signedUrlData?.signedUrl ?? null;
    }
  }

  /*
   * Load current security-system status.
   */
  const { data: securityStatus, error: securityError } = await supabase
    .from("security_status")
    .select("armed, updated_at")
    .eq("home_id", homeId)
    .maybeSingle();

  if (securityError) {
    console.error(
      "Security status loading error:",
      securityError
    );
  }

  return {
    event,
    recording,
    recordingCamera,
    signedVideoUrl,
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

function getRecordingStatusStyle(status: string) {
  switch (status) {
    case "ready":
      return "bg-emerald-500/20 text-emerald-400";

    case "pending":
      return "bg-blue-500/20 text-blue-400";

    case "failed":
      return "bg-red-500/20 text-red-400";

    default:
      return "bg-slate-800 text-slate-300";
  }
}

function getDuration(
  startedAt: string | null,
  endedAt: string | null
) {
  if (!startedAt || !endedAt) {
    return null;
  }

  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    end <= start
  ) {
    return null;
  }

  const seconds = Math.round((end - start) / 1000);

  if (seconds < 60) {
    return `${seconds} seconds`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

export default async function SecurityEventPage({
  params,
}: PageProps) {
  const { id } = await params;

  const data = await getSecurityEvent(id);

  if (!data) {
    notFound();
  }

  const {
    event,
    recording,
    recordingCamera,
    signedVideoUrl,
    alert,
    securityStatus,
  } = data;

  const device = Array.isArray(event.devices)
    ? event.devices[0]
    : event.devices;

  const severity = alert?.severity ?? "low";

  const recordingStatus =
    recording?.status?.toLowerCase() ?? "not available";

  const duration = recording
    ? getDuration(
        recording.started_at ?? null,
        recording.ended_at ?? null
      )
    : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <DashboardNavbar />

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* Back */}
        <Link
          href="/alerts"
          className="text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          ← Back to Alerts
        </Link>

        {/* Header */}
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

        {/* Event Summary */}
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
                {alert?.title ||
                  formatEventType(event.event_type)}
              </h2>

              <p className="mt-2 leading-7 text-slate-400">
                {event.description}
              </p>
            </div>
          </div>
        </section>

        {/* Event + Device */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">

          {/* Event Information */}
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

          {/* Triggering Device */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              Triggering Device
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

        {/* Security Status */}
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
              {formatDate(
                securityStatus?.updated_at ?? null
              )}
            </p>

          </div>
        </section>

        {/* Security Recording */}
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

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getRecordingStatusStyle(
                recordingStatus
              )}`}
            >
              {recordingStatus}
            </span>

          </div>

          {recording ? (
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">

              {/* Pending */}
              {recordingStatus === "pending" && (
                <div className="p-6">

                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-blue-400" />

                    <p className="font-medium text-blue-400">
                      Recording is being prepared
                    </p>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    The security event has been linked to the
                    appropriate camera. The recording will become
                    available when the video upload is complete.
                  </p>

                </div>
              )}

              {/* Ready + Signed URL */}
              {recordingStatus === "ready" &&
                signedVideoUrl && (
                  <div>

                    {/* Video */}
                    <div className="relative aspect-video bg-black">

                      <video
                        controls
                        playsInline
                        preload="metadata"
                        poster={
                          recording.thumbnail_url || undefined
                        }
                        className="h-full w-full bg-black object-contain"
                      >
                        <source
                          src={signedVideoUrl}
                          type="video/webm"
                        />

                        Your browser does not support
                        HTML5 video playback.
                      </video>

                    </div>

                    {/* Recording details */}
                    <div className="border-t border-slate-800 p-5">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div>
                          <p className="font-semibold text-emerald-400">
                            Recording available
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Secure CCTV footage for this security event.
                          </p>
                        </div>

                        <a
                          href={signedVideoUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                          ↓ Download Recording
                        </a>

                      </div>

                      {/* Camera information */}
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">

                        <div className="rounded-xl bg-slate-900 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Camera
                          </p>

                          <p className="mt-1 text-sm font-medium text-white">
                            {recordingCamera?.name ||
                              "Unknown camera"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-900 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Location
                          </p>

                          <p className="mt-1 text-sm font-medium text-white">
                            {recordingCamera?.location ||
                              device?.location ||
                              "Not specified"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-900 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Recorded
                          </p>

                          <p className="mt-1 text-sm font-medium text-white">
                            {formatDate(
                              recording.created_at
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-900 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Duration
                          </p>

                          <p className="mt-1 text-sm font-medium text-white">
                            {duration || "Not available"}
                          </p>
                        </div>

                      </div>

                      {/* Camera status */}
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">

                        <span
                          className={`h-2 w-2 rounded-full ${
                            recordingCamera?.status?.toLowerCase() ===
                            "online"
                              ? "bg-emerald-400"
                              : "bg-slate-600"
                          }`}
                        />

                        Camera status:{" "}
                        {recordingCamera?.status ||
                          "Unknown"}

                      </div>

                    </div>
                  </div>
                )}

              {/* Ready but signed URL failed */}
              {recordingStatus === "ready" &&
                !signedVideoUrl && (
                  <div className="p-6">

                    <p className="font-medium text-yellow-400">
                      Recording exists, but playback is unavailable
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      The recording was saved successfully, but
                      a secure playback URL could not be generated.
                      Please try refreshing the page.
                    </p>

                  </div>
                )}

              {/* Failed */}
              {recordingStatus === "failed" && (
                <div className="p-6">

                  <p className="font-medium text-red-400">
                    Recording failed
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    The security event was recorded, but the CCTV
                    footage could not be saved successfully.
                  </p>

                </div>
              )}

              {/* Unknown recording state */}
              {!["pending", "ready", "failed"].includes(
                recordingStatus
              ) && (
                <div className="p-6">

                  <p className="font-medium">
                    Recording status unavailable
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    A recording record exists, but its current
                    processing state could not be determined.
                  </p>

                </div>
              )}

            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5">

              <p className="font-medium">
                No recording attached
              </p>

              <p className="mt-2 text-sm text-slate-400">
                No camera recording was associated with this event.
                This can happen when no camera covers the event
                location or the responsible camera was offline.
              </p>

            </div>
          )}

        </section>

        {/* Alert Information */}
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