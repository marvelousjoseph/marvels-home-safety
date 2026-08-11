"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function resolveAlert(alertId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("home_members")
    .select("home_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.home_id) {
    throw new Error("Could not find your home.");
  }

  const { error } = await supabase
    .from("alerts")
    .update({
      resolved: true,
    })
    .eq("id", alertId)
    .eq("home_id", membership.home_id);

  if (error) {
    console.error("Resolve alert error:", error);
    throw new Error("Could not resolve the alert.");
  }

  revalidatePath("/alerts");
  revalidatePath("/dashboard");
}
