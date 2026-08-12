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

  const homeId = membership.home_id;

  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select("id, name, status")
    .eq("home_id", homeId)
    .eq("name", "Front Door Sensor")
    .limit(1)
    .maybeSingle();

  if (deviceError || !device) {
    throw new Error("Front Door Sensor was not found.");
  }

  // Record the physical-device event.
  const { error: eventError } = await supabase
    .from("device_events")
    .insert({
      home_id: homeId,
      device_id: device.id,
      event_type: "door_opened",
      description: "The front door was opened.",
    });

  if (eventError) {
    console.error("Device event error:", eventError);
    throw new Error("Could not create the device event.");
  }

  // Create a security alert from the device event.
  const { error: alertError } = await supabase
    .from("alerts")
    .insert({
      home_id: homeId,
      title: "Front Door Opened",
      description: "The Front Door Sensor detected that the front door was opened.",
      severity: "high",
      resolved: false,
    });

  if (alertError) {
    console.error("Alert creation error:", alertError);

    throw new Error(
      `Alert creation failed: ${alertError.message} | Code: ${alertError.code ?? "unknown"}`
    );
  }

  // Make sure the device is reported as online.
  const { error: deviceStatusError } = await supabase
    .from("devices")
    .update({
      status: "Online",
    })
    .eq("id", device.id)
    .eq("home_id", homeId);

  if (deviceStatusError) {
    console.error("Device status update error:", deviceStatusError);
    throw new Error("The event and alert were created, but device status could not be updated.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/alerts");
  revalidatePath("/devices");
  revalidatePath("/security");
}
