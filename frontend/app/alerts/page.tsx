import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import DashboardNavbar from "@/components/DashboardNavbar";
import RealtimeAlerts from "@/components/RealtimeAlerts";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { resolveAlert } from "./actions";

export const dynamic = "force-dynamic";

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

async function getAlerts() {
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

  const { data, error } = await supabase
    .from("alerts")
    .select(`
      *,
      security_event_recordings (
        id,
        status,
        video_url,
        storage_path,
        thumbnail_url,
        created_at,
        camera_id,
        devices (
          name,
          location
        )
      )
    `)
    .eq("home_id", membership.home_id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Error loading alerts:", error);
    return [];
  }

  const alerts = data ?? [];

  /*
   * Use the server-side service client to create signed
   * URLs for the PRIVATE security-recordings bucket.
   *
   * storage_path is the source of truth.
   */
  const service = createServiceClient();

  const alertsWithSignedUrls = await Promise.all(
    alerts.map(async (alert) => {
      const recordings = Array.isArray(
        alert.security_event_recordings
      )
        ? alert.security_event_recordings
        : alert.security_event_recordings
          ? [alert.security_event_recordings]
          : [];

      const recordingsWithUrls = await Promise.all(
        recordings.map(async (recording: any) => {
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
              "Could not create alert recording signed URL:",
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

      return {
        ...alert,
        security_event_recordings:
          recordingsWithUrls,
      };
    })
  );

  return alertsWithSignedUrls;
}

function formatAlertTime(
  createdAt: string | null
) {
  if (!createdAt) {
    return "Unknown time";
  }

  const created = new Date(createdAt);
  const now = new Date();

  const diff =
    now.getTime() -
    created.getTime();

  const minutes = Math.floor(
    diff / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return created.toLocaleString(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function getSeverity(
  severity: string | null | undefined
) {
  return severity?.toLowerCase() ?? "unknown";
}

function getSeverityLabel(
  severity: string | null | undefined
) {
  const normalized = getSeverity(severity);

  if (normalized === "critical") {
    return "Critical";
  }

  if (normalized === "high") {
    return "High";
  }

  if (normalized === "medium") {
    return "Medium";
  }

  if (normalized === "low") {
    return "Low";
  }

  return "Alert";
}

function getSeverityIndicator(
  severity: string | null | undefined
) {
  const normalized = getSeverity(severity);

  if (normalized === "critical") {
    return "bg-red-500";
  }

  if (normalized === "high") {
    return "bg-orange-400";
  }

  if (normalized === "medium") {
    return "bg-yellow-400";
  }

  return "bg-blue-400";
}

function getSeverityBadge(
  severity: string | null | undefined,
  resolved: boolean
) {
  if (resolved) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  const normalized = getSeverity(severity);

  if (normalized === "critical") {
    return "border-red-500/20 bg-red-500/10 text-red-300";
  }

  if (normalized === "high") {
    return "border-orange-500/20 bg-orange-500/10 text-orange-300";
  }

  if (normalized === "medium") {
    return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
  }

  return "border-blue-500/20 bg-blue-500/10 text-blue-300";
}

function getRecordingStatusStyle(
  status: string | null | undefined
) {
  const normalized = status?.toLowerCase();

  if (normalized === "ready") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (normalized === "failed") {
    return "border-red-500/20 bg-red-500/10 text-red-300";
  }

  return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
}

export default async function AlertsPage() {
  const alerts = await getAlerts();

  const activeAlerts = alerts.filter(
    (alert) => !alert.resolved
  );

  const critical = activeAlerts.filter(
    (alert) =>
      alert.severity?.toLowerCase() ===
      "critical"
  );

  const warnings = activeAlerts.filter(
    (alert) => {
      const severity =
        alert.severity?.toLowerCase();

      return (
        severity === "high" ||
        severity === "medium"
      );
    }
  );

  const resolved = alerts.filter(
    (alert) => alert.resolved
  );

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <RealtimeAlerts />

      <DashboardNavbar />

      <div className="relative overflow-hidden">
        {/* Subtle page lighting */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.10),transparent_65%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
          {/* Page header */}
          <header className="border-b border-slate-800/80 pb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Security Operations
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Alerts
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Review security events, investigate connected
                  camera footage, and resolve incidents from one
                  place.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 lg:self-auto">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Live monitoring
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Realtime updates enabled
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Alert overview */}
          <section className="grid border-b border-slate-800/80 sm:grid-cols-3">
            <div className="border-b border-slate-800/80 py-6 sm:border-b-0 sm:border-r sm:pr-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Critical
                </p>
              </div>

              <p className="mt-3 text-3xl font-semibold text-white">
                {critical.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {critical.length === 0
                  ? "No critical alerts"
                  : "Require immediate attention"}
              </p>
            </div>

            <div className="border-b border-slate-800/80 py-6 sm:border-b-0 sm:border-r sm:px-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Warnings
                </p>
              </div>

              <p className="mt-3 text-3xl font-semibold text-white">
                {warnings.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {warnings.length === 0
                  ? "No active warnings"
                  : "Active security warnings"}
              </p>
            </div>

            <div className="py-6 sm:pl-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Resolved
                </p>
              </div>

              <p className="mt-3 text-3xl font-semibold text-white">
                {resolved.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Security events resolved
              </p>
            </div>
          </section>

          {/* Alerts list */}
          <section className="pt-9">
            <div className="flex flex-col gap-2 border-b border-slate-800/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-400">
                  Event log
                </p>

                <h2 className="mt-1 text-xl font-semibold text-white">
                  Recent security alerts
                </h2>
              </div>

              <p className="text-sm text-slate-500">
                {activeAlerts.length} active{" "}
                {activeAlerts.length === 1
                  ? "alert"
                  : "alerts"}
              </p>
            </div>

            <div className="mt-5">
              {alerts.length === 0 ? (
                <div className="border border-slate-800 bg-slate-900/40 px-6 py-12 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center border border-slate-700 bg-slate-950 text-slate-500">
                    —
                  </div>

                  <p className="mt-4 font-medium text-slate-200">
                    No alerts found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Your security system has not recorded any
                    alerts for this home.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 border-y border-slate-800/80">
                  {alerts.map((alert) => {
                    const recording =
                      Array.isArray(
                        alert.security_event_recordings
                      )
                        ? alert
                            .security_event_recordings[0]
                        : alert.security_event_recordings;

                    const severity =
                      getSeverity(alert.severity);

                    return (
                      <article
                        key={alert.id}
                        className="py-7"
                      >
                        <div className="flex flex-col gap-6">
                          {/* Alert information */}
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <span
                                  className={`inline-flex items-center gap-2 border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getSeverityBadge(
                                    alert.severity,
                                    alert.resolved
                                  )}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      alert.resolved
                                        ? "bg-emerald-400"
                                        : getSeverityIndicator(
                                            alert.severity
                                          )
                                    }`}
                                  />

                                  {alert.resolved
                                    ? "Resolved"
                                    : getSeverityLabel(
                                        alert.severity
                                      )}
                                </span>

                                <span className="text-xs text-slate-600">
                                  {severity !== "unknown"
                                    ? severity.toUpperCase()
                                    : "SECURITY EVENT"}
                                </span>
                              </div>

                              <h3 className="mt-3 text-lg font-semibold text-white">
                                {alert.title}
                              </h3>

                              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                                {alert.description}
                              </p>

                              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                                <span>
                                  {formatAlertTime(
                                    alert.created_at
                                  )}
                                </span>

                                {recording?.devices?.name && (
                                  <span>
                                    Camera:{" "}
                                    <span className="text-slate-400">
                                      {
                                        recording.devices
                                          .name
                                      }
                                    </span>
                                  </span>
                                )}

                                {recording?.devices
                                  ?.location && (
                                  <span>
                                    Location:{" "}
                                    <span className="text-slate-400">
                                      {
                                        recording.devices
                                          .location
                                      }
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {!alert.resolved && (
                              <form
                                action={resolveAlert.bind(
                                  null,
                                  alert.id
                                )}
                                className="shrink-0"
                              >
                                <button
                                  type="submit"
                                  className="inline-flex w-full items-center justify-center border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-500/10 sm:w-auto"
                                >
                                  Resolve alert
                                </button>
                              </form>
                            )}
                          </div>

                          {/* CCTV evidence */}
                          {recording && (
                            <div className="border border-slate-800 bg-[#030712]">
                              <div className="flex flex-col gap-4 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center border border-slate-700 bg-slate-900 text-xs text-blue-300">
                                      CAM
                                    </span>

                                    <div>
                                      <p className="text-sm font-semibold text-slate-200">
                                        CCTV evidence
                                      </p>

                                      <p className="mt-0.5 text-xs text-slate-500">
                                        {recording.devices
                                          ?.name ??
                                          "Security Camera"}

                                        {recording.devices
                                          ?.location
                                          ? ` • ${recording.devices.location}`
                                          : ""}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <span
                                  className={`inline-flex w-fit border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getRecordingStatusStyle(
                                    recording.status
                                  )}`}
                                >
                                  {recording.status?.toUpperCase() ||
                                    "PENDING"}
                                </span>
                              </div>

                              <div className="p-5">
                                {recording.status ===
                                  "pending" && (
                                  <div className="border border-yellow-500/20 bg-yellow-500/5 px-5 py-6">
                                    <div className="flex gap-4">
                                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-yellow-400" />

                                      <div>
                                        <p className="font-medium text-yellow-200">
                                          Recording is being prepared
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                          The security event has
                                          been recorded. CCTV
                                          footage will appear
                                          here automatically when
                                          it becomes available.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {recording.status ===
                                  "failed" && (
                                  <div className="border border-red-500/20 bg-red-500/5 px-5 py-6">
                                    <div className="flex gap-4">
                                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-400" />

                                      <div>
                                        <p className="font-medium text-red-200">
                                          Recording unavailable
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                          CCTV footage could not
                                          be prepared for this
                                          security event.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {recording.status ===
                                  "ready" && (
                                  <div className="overflow-hidden border border-slate-800 bg-black">
                                    {recording.video_url ? (
                                      <>
                                        <video
                                          className="aspect-video h-auto w-full bg-black object-contain"
                                          controls
                                          preload="metadata"
                                          playsInline
                                        >
                                          <source
                                            src={
                                              recording.video_url
                                            }
                                            type="video/webm"
                                          />

                                          Your browser does not support video playback.
                                        </video>

                                        {/* Branded CCTV footer */}
                                        <div className="flex flex-col items-center justify-center border-t border-slate-800 bg-[#020617] px-4 py-5">
                                          <div className="relative h-14 w-40">
                                            <Image
                                              src="/marvels-home-safety-logo.png"
                                              alt="Marvels Home Safety"
                                              fill
                                              sizes="160px"
                                              className="object-contain"
                                            />
                                          </div>

                                          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-600">
                                            Security recording
                                          </p>
                                        </div>
                                      </>
                                    ) : recording.thumbnail_url ? (
                                      <>
                                        <Image
                                          src={
                                            recording.thumbnail_url
                                          }
                                          alt="Security recording preview"
                                          width={800}
                                          height={400}
                                          className="h-auto max-h-[480px] w-full object-cover"
                                        />

                                        <div className="flex flex-col items-center justify-center border-t border-slate-800 bg-[#020617] px-4 py-5">
                                          <div className="relative h-14 w-40">
                                            <Image
                                              src="/marvels-home-safety-logo.png"
                                              alt="Marvels Home Safety"
                                              fill
                                              sizes="160px"
                                              className="object-contain"
                                            />
                                          </div>

                                          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-600">
                                            Security recording
                                          </p>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex h-56 items-center justify-center">
                                        <div className="text-center">
                                          <p className="text-sm font-medium text-slate-400">
                                            Preview unavailable
                                          </p>

                                          <p className="mt-1 text-xs text-slate-600">
                                            The recording exists but
                                            no preview is available.
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    <div className="border-t border-slate-800 bg-[#030712] px-5 py-4">
                                      {recording.video_url ? (
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                          <div>
                                            <p className="text-xs font-medium text-slate-400">
                                              Secure footage
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-600">
                                              Temporary protected
                                              playback link
                                            </p>
                                          </div>

                                          <a
                                            href={
                                              recording.video_url
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300 transition hover:border-blue-400/50 hover:bg-blue-500/15"
                                          >
                                            Open footage
                                          </a>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-slate-500">
                                          Video is ready, but a secure
                                          playback URL could not be
                                          generated.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}