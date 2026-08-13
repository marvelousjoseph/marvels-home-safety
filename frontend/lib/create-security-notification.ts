import { createClient } from "@supabase/supabase-js";

type NotificationInput = {
  homeId: string;
  alertId: string;
  title: string;
  message: string;
};

export async function createSecurityNotifications({
  homeId,
  alertId,
  title,
  message,
}: NotificationInput) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data: members, error: memberError } = await supabase
    .from("home_members")
    .select("user_id")
    .eq("home_id", homeId);

  if (memberError) {
    throw new Error("Could not find home members.");
  }

  if (!members || members.length === 0) {
    return [];
  }

  const notifications = members.map((member) => ({
    home_id: homeId,
    user_id: member.user_id,
    alert_id: alertId,
    title,
    message,
    type: "security",
    read: false,
  }));

  const { data, error } = await supabase
    .from("notifications")
    .insert(notifications)
    .select();

  if (error) {
    console.error("Notification creation error:", error);
    throw new Error("Could not create security notifications.");
  }

  return data ?? [];
}
