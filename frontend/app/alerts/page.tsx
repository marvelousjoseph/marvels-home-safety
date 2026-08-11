import Navbar from "@/components/Navbar";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { resolveAlert } from "./actions";

export const dynamic = "force-dynamic";

async function getAlerts() {
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
    .from("alerts")
    .select("*")
    .eq("home_id", membership.home_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading alerts:", error);
    return [];
  }

  return data ?? [];
}

function formatAlertTime(createdAt: string | null) {
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

export default async function AlertsPage() {
  const alerts = await getAlerts();

  const activeAlerts = alerts.filter(
    (alert) => alert.resolved === false
  );

  const critical = activeAlerts.filter(
    (alert) => alert.severity?.toLowerCase() === "critical"
  );

  const warnings = activeAlerts.filter(
    (alert) =>
      alert.severity?.toLowerCase() === "high" ||
      alert.severity?.toLowerCase() === "medium"
  );

  const resolved = alerts.filter(
    (alert) => alert.resolved === true
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-medium text-blue-400">
          MARVEL&apos;S HOME SAFETY
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Alerts
        </h1>

        <p className="mt-2 text-slate-400">
          Review security events and potential threats around your home.
        </p>

        {/* Summary */}
        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-6">
            <p className="text-sm text-slate-400">
              Critical
            </p>

            <p className="mt-3 text-3xl font-bold">
              {critical.length}
            </p>

            <p className="mt-2 text-sm text-red-400">
              {critical.length === 0
                ? "No critical alerts"
                : "Critical alerts"}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-900 bg-yellow-950/30 p-6">
            <p className="text-sm text-slate-400">
              Warnings
            </p>

            <p className="mt-3 text-3xl font-bold">
              {warnings.length}
            </p>

            <p className="mt-2 text-sm text-yellow-400">
              {warnings.length === 0
                ? "No warnings"
                : "Active warnings"}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-900 bg-emerald-950/30 p-6">
            <p className="text-sm text-slate-400">
              Resolved
            </p>

            <p className="mt-3 text-3xl font-bold">
              {resolved.length}
            </p>

            <p className="mt-2 text-sm text-emerald-400">
              Resolved alerts
            </p>
          </div>
        </section>

        {/* Alerts */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Recent Alerts
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {activeAlerts.length} active alert
                {activeAlerts.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {alerts.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="font-medium">
                  No alerts found
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  There are currently no security alerts in your home.
                </p>
              </div>
            ) : (
              alerts.map((alert) => {
                const severity =
                  alert.severity?.toLowerCase();

                const severityStyle =
                  alert.resolved
                    ? "bg-emerald-500/20 text-emerald-400"
                    : severity === "critical"
                      ? "bg-red-500/20 text-red-400"
                      : severity === "high"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-yellow-500/20 text-yellow-400";

                return (
                  <div
                    key={alert.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${severityStyle}`}
                          >
                            {alert.resolved
                              ? "RESOLVED"
                              : severity?.toUpperCase()}
                          </span>

                          <p className="font-medium">
                            {alert.title}
                          </p>
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {alert.description}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {formatAlertTime(alert.created_at)}
                        </p>
                      </div>

                      {!alert.resolved && (
                        <form
                          action={resolveAlert.bind(
                            null,
                            alert.id
                          )}
                        >
                          <button
                            type="submit"
                            className="rounded-lg border border-emerald-700 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                          >
                            Resolve Alert
                          </button>
                        </form>
                      )}
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
