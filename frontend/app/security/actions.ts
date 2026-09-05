"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function changeSecurityStatus(armed: boolean) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("home_members")
    .select("home_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    console.error("Membership error:", membershipError);
    throw new Error("Could not find your home.");
  }

  if (!membership?.home_id) {
    throw new Error("You are not a member of a home.");
  }

  if (membership.role !== "admin") {
    throw new Error(
      "Only a home admin can change the security status."
    );
  }

  const { error } = await supabase
    .from("security_status")
    .update({
      armed,
      updated_at: new Date().toISOString(),
    })
    .eq("home_id", membership.home_id);

  if (error) {
    console.error("Security status update error:", error);
    throw new Error("Could not update security status.");
  }

  revalidatePath("/security");
  revalidatePath("/dashboard");
}

export async function armSystem() {
  await changeSecurityStatus(true);
}

export async function disarmSystem() {
  await changeSecurityStatus(false);
}