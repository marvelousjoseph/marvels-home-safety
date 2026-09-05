"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { processDeviceEvent } from "@/lib/process-device-event";

async function getUserHome() {
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

  return {
    supabase,
    homeId: membership.home_id,
  };
}

async function getUserHomeAndDevice(deviceId: string) {
  const { supabase, homeId } = await getUserHome();

  const { data: device, error } = await supabase
    .from("devices")
    .select("id, name, type, location, status, home_id")
    .eq("id", deviceId)
    .eq("home_id", homeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not find device: ${error.message}`);
  }

  if (!device) {
    throw new Error("The selected device was not found.");
  }

  return {
    supabase,
    homeId,
    device,
  };
}

async function getDeviceIdByName(deviceName: string) {
  const { supabase, homeId } = await getUserHome();

  const { data: device, error } = await supabase
    .from("devices")
    .select("id")
    .eq("home_id", homeId)
    .eq("name", deviceName)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not find ${deviceName}: ${error.message}`);
  }

  if (!device) {
    throw new Error(`${deviceName} was not found.`);
  }

  return device.id;
}

/**
 * Development-only test for the front-door sensor.
 */
export async function simulateFrontDoorOpen() {
  const deviceId = await getDeviceIdByName("Front Door Sensor");

  await processDeviceEvent({
    deviceId,
    eventType: "door_opened",
    description: "The front door was opened.",
  });

  revalidateSecurityPaths();
}

/**
 * Development-only test for any camera.
 *
 * The camera is identified by its actual database device ID.
 * There is no hard-coded camera name here.
 */
export async function simulateCameraPersonDetection(cameraId: string) {
  if (!cameraId) {
    throw new Error("Camera ID is required.");
  }

  const { device } = await getUserHomeAndDevice(cameraId);

  const deviceType = device.type?.toLowerCase() ?? "";
  const deviceName = device.name?.toLowerCase() ?? "";

  if (
    !deviceType.includes("camera") &&
    !deviceName.includes("camera")
  ) {
    throw new Error("The selected device is not a camera.");
  }

  await processDeviceEvent({
    deviceId: device.id,
    eventType: "person_detected",
    description: `${device.name} detected a person.`,
  });

  revalidateSecurityPaths();
}

function revalidateSecurityPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/alerts");
  revalidatePath("/devices");
  revalidatePath("/security");
  revalidatePath("/activity");
  revalidatePath("/home");
}
