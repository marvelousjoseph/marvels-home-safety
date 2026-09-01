import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import DashboardNavbar from "@/components/DashboardNavbar";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Recording = {
  id: string;
  home_id: string;
  device_event_id: string | null;
  alert_id: string | null;
  camera_id: string | null;
  storage_path: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  started_at: string | null;
  ended_at: string | null;
  status: string;
  created_at: string;

  camera?: {
    name: string;
    type: string;
    location: string | null;
  } | null;

  event?: {
    event_type: string;
    description: string | null;
  } | null;

  alert?: {
    title: string;
    severity: string;
    resolved: boolean;
  } | null;
};

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getRecordings(): Promise<Recording[]> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("home_members")
    .select("home_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.home_id) {
    console.error(
      "Could not determine user's home:",
      membershipError
    );

    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("security_event_recordings")
    .select(`
      id,
      home_id,
      device_event_id,
      alert_id,
      camera_id,
      storage_path,
      video_url,
      thumbnail_url,
      started_at,
      ended_at,
      status,
      created_at,
      camera:devices!security_event_recordings_camera_id_fkey (
        name,
        type,
        location
      ),
      event:device_events!security_event_recordings_device_event_id_fkey (
        event_type,
        description
      ),
      alert:alerts!security_event_recordings_alert_id_fkey (
        title,
        severity,
        resolved
      )
    `)
    .eq("home_id", membership.home_id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading security recordings:",
      error
    );

    return [];
  }

  const recordings = (data ?? []) as unknown as Recording[];

  /*
   * Generate secure temporary URLs using the server-side
   * Supabase service client.
   *
   * The bucket remains PRIVATE.
   *
   * storage_path is always treated as the source of truth.
   */
  const service = createServiceClient();

  const recordingsWithSignedUrls = await Promise.all(
    recordings.map(async (recording) => {
      const status = recording.status?.toLowerCase();

      if (
        status !== "ready" ||
        !recording.storage_path
      ) {
        return {
          ...recording,
          video_url: null,
        };
      }

      const {
        data: signedUrlData,
        error: signedUrlError,
      } = await service.storage
        .from("security-recordings")
        .createSignedUrl(
          recording.storage_path,
          60 * 60
        );

      if (
        signedUrlError ||
        !signedUrlData?.signedUrl
      ) {
        console.error(
          "Could not create recording signed URL:",
          {
            recordingId: recording.id,
            storagePath: recording.storage_path,
            error: signedUrlError,
          }
        );

        return {
          ...recording,
          video_url: null,
        };
      }

      return {
        ...recording,
        video_url: signedUrlData.signedUrl,
      };
    })
  );

  return recordingsWithSignedUrls;
}

function formatDate(date: string | null) {
  if (!date) {
    return "Time unavailable";
  }

  return new Date(date).toLocaleString(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function formatEventType(
  eventType: string | null | undefined
) {
  if (!eventType) {
    return "Security Event";
  }

  return eventType
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    );
}

function getSeverityClass(
  severity: string | null | undefined
) {
  const value = severity?.toLowerCase();

  if (value === "critical") {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }

  if (value === "high") {
    return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  }

  if (value === "medium") {
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  }

  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
}

function getStatusClass(
  status: string | null | undefined
) {
  const value = status?.toLowerCase();

  if (value === "ready") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  if (value === "failed") {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }

  return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
}

export default async function RecordingsPage() {
  const recordings = await getRecordings();

  const readyRecordings = recordings.filter(
    (recording) =>
      recording.status?.toLowerCase() === "ready" &&
      Boolean(recording.video_url)
  );

  const pendingRecordings = recordings.filter(
    (recording) =>
      recording.status?.toLowerCase() === "pending"
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section>
          <p className="text-sm font-semibold tracking-wider text-blue-400">
            MARVEL&apos;S HOME SAFETY
          </p>

          <div className="mt-2 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Security Recordings
              </h1>

              <p className="mt-2 max-w-2xl text-slate-400">
                Review CCTV recordings generated automatically from security
                events detected in your home.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              SECURITY RECORDINGS
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Total Recordings
            </p>

            <p className="mt-3 text-3xl font-bold">
              {recordings.length}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Security events recorded
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <p className="text-sm text-slate-400">
              Available to View
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-400">
              {readyRecordings.length}
            </p>

            <p className="mt-2 text-sm text-emerald-400">
              CCTV videos ready
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-900 bg-yellow-950/20 p-6">
            <p className="text-sm text-slate-400">
              Processing
            </p>

            <p className="mt-3 text-3xl font-bold text-yellow-400">
              {pendingRecordings.length}
            </p>

            <p className="mt-2 text-sm text-yellow-400">
              Awaiting CCTV footage
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Event Recordings
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Recordings are generated by the security event system.
            </p>
          </div>

          {recordings.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
                📹
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No security recordings
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
                When a security event triggers CCTV recording, the recording
                will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {recordings.map((recording) => {
                const camera = Array.isArray(
                  recording.camera
                )
                  ? recording.camera[0]
                  : recording.camera;

                const event = Array.isArray(
                  recording.event
                )
                  ? recording.event[0]
                  : recording.event;

                const alert = Array.isArray(
                  recording.alert
                )
                  ? recording.alert[0]
                  : recording.alert;

                const hasVideo =
                  Boolean(recording.video_url);

                const status =
                  recording.status?.toLowerCase();

                return (
                  <article
                    key={recording.id}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
                  >
                    <div className="grid lg:grid-cols-[minmax(0,1fr)_380px]">
                      <div className="bg-black">
                        {hasVideo ? (
                          <video
                            className="aspect-video h-full w-full bg-black object-contain"
                            controls
                            preload="metadata"
                            playsInline
                            poster={
                              recording.thumbnail_url ||
                              undefined
                            }
                          >
                            <source
                              src={recording.video_url || undefined}
                              type="video/webm"
                            />
                            Your browser does not support video playback.
                          </video>
                        ) : recording.thumbnail_url ? (
                          <div className="relative aspect-video bg-slate-950">
                            <Image
                              src={recording.thumbnail_url}
                              alt="Security event recording thumbnail"
                              width={800}
                              height={450}
                              className="h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <div className="rounded-full bg-black/60 px-5 py-3 text-sm font-semibold text-white backdrop-blur">
                                {status === "pending"
                                  ? "Recording pending"
                                  : "Video unavailable"}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex aspect-video items-center justify-center bg-slate-950">
                            <div className="text-center">
                              <div className="text-5xl">
                                📹
                              </div>

                              <p className="mt-4 font-semibold text-slate-300">
                                CCTV Recording
                              </p>

                              <p className="mt-2 text-sm text-slate-500">
                                {status === "pending"
                                  ? "Waiting for CCTV footage"
                                  : "Video is not available"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold tracking-wider text-blue-400">
                              SECURITY EVENT
                            </p>

                            <h3 className="mt-2 text-xl font-semibold">
                              {alert?.title ||
                                formatEventType(
                                  event?.event_type
                                )}
                            </h3>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusClass(
                              recording.status
                            )}`}
                          >
                            {recording.status ||
                              "pending"}
                          </span>
                        </div>

                        <div className="mt-6 space-y-4">
                          <div>
                            <p className="text-[10px] font-bold tracking-wider text-slate-500">
                              CAMERA
                            </p>

                            <p className="mt-1 text-sm text-slate-200">
                              {camera?.name ||
                                "Security Camera"}
                            </p>

                            {camera?.location && (
                              <p className="mt-1 text-xs text-slate-500">
                                {camera.location}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-[10px] font-bold tracking-wider text-slate-500">
                              EVENT
                            </p>

                            <p className="mt-1 text-sm text-slate-300">
                              {event?.description ||
                                formatEventType(
                                  event?.event_type
                                )}
                            </p>
                          </div>

                          {alert?.severity && (
                            <div>
                              <p className="text-[10px] font-bold tracking-wider text-slate-500">
                                SEVERITY
                              </p>

                              <span
                                className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getSeverityClass(
                                  alert.severity
                                )}`}
                              >
                                {alert.severity}
                              </span>
                            </div>
                          )}

                          <div>
                            <p className="text-[10px] font-bold tracking-wider text-slate-500">
                              DETECTED
                            </p>

                            <p className="mt-1 text-sm text-slate-300">
                              {formatDate(
                                recording.created_at
                              )}
                            </p>
                          </div>

                          {alert && (
                            <div>
                              <p className="text-[10px] font-bold tracking-wider text-slate-500">
                                ALERT STATUS
                              </p>

                              <p
                                className={`mt-1 text-sm font-medium ${
                                  alert.resolved
                                    ? "text-emerald-400"
                                    : "text-orange-400"
                                }`}
                              >
                                {alert.resolved
                                  ? "Resolved"
                                  : "Active"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-blue-900/50 bg-blue-950/20 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
              🔒
            </div>

            <div>
              <h2 className="font-semibold text-blue-300">
                Automatic Security Recordings
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Recordings on this page are created automatically by the
                security event system. Users cannot upload or manually insert
                CCTV footage.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
