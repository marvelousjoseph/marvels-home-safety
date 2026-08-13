"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { processDeviceEvent } from "@/lib/process-device-event";

export async function simulateFrontDoorOpen() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data: membership } = await supabase
    .from("home_members")
    .select("home_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.home_id) {
    throw new Error("Could not find your home.");
  }

  const { data: device } = await supabase
    .from("devices")
    .select("id")
    .eq("home_id", membership.home_id)
    .eq("name", "Front Door Sensor")
    .limit(1)
    .maybeSingle();

  if (!device) {
    throw new Error("Front Door Sensor was not found.");
  }

  await processDeviceEvent(
    {
      deviceId: device.id,
      eventType: "door_opened",
      description: "The front door was opened.",
    },
    { authenticatedUser: true }
  );

  revalidatePath("/dashboard");
  revalidatePath("/alerts");
  revalidatePath("/devices");
  revalidatePath("/security");
  revalidatePath("/activity");
  revalidatePath("/home");
}
