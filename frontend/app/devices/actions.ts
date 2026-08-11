"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function simulateFrontDoorOpen() {
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

  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select("id")
    .eq("home_id", membership.home_id)
    .eq("name", "Front Door Sensor")
    .limit(1)
    .maybeSingle();

  if (deviceError || !device) {
    throw new Error("Front Door Sensor was not found.");
  }

  const { error } = await supabase.from("device_events").insert({
    home_id: membership.home_id,
    device_id: device.id,
    event_type: "door_opened",
    description: "The front door was opened.",
  });

  if (error) {
    console.error("Device event error:", error);
    throw new Error("Could not create the device event.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/alerts");
  revalidatePath("/devices");
}
