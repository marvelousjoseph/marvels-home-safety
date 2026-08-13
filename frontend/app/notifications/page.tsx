import DashboardNavbar from "@/components/DashboardNavbar";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "./actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function getNotifications() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Notification loading error:", error);
    return [];
  }

  return data ?? [];
}

function formatNotificationTime(createdAt: string) {
  const created = new Date(createdAt);
  const now = new Date();

  const minutes = Math.floor(
    (now.getTime() - created.getTime()) / 60000
  );

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

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  const unread = notifications.filter(
    (notification) => !notification.read
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <DashboardNavbar />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section>
          <p className="text-sm font-semibold tracking-wider text-blue-400">
            MARVEL&apos;S HOME SAFETY
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Notifications
              </h1>

              <p className="mt-2 text-slate-400">
                Security notifications from your home.
              </p>
            </div>

            {unread.length > 0 && (
              <form action={markAllNotificationsRead}>
                <button
                  type="submit"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  Mark all as read
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Recent Notifications
            </h2>

            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              {unread.length} unread
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                🔔
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No notifications
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Security notifications will appear here when events
                require your attention.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-2xl border p-5 ${
                    notification.read
                      ? "border-slate-800 bg-slate-900"
                      : "border-blue-900 bg-blue-950/20"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          notification.read
                            ? "bg-slate-800"
                            : "bg-blue-500/10"
                        }`}
                      >
                        🔔
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold">
                            {notification.title}
                          </h3>

                          {!notification.read && (
                            <span className="rounded-full bg-blue-500/20 px-2 py-1 text-[10px] font-bold text-blue-400">
                              NEW
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {formatNotificationTime(
                            notification.created_at
                          )}
                        </p>
                      </div>
                    </div>

                    {!notification.read && (
                      <form
                        action={markNotificationRead.bind(
                          null,
                          notification.id
                        )}
                      >
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
                        >
                          Mark as read
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
