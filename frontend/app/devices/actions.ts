"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { processDeviceEvent } from "@/lib/process-device-event";

async function getAdminHome() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("home_members")
    .select("home_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    console.error("Home membership lookup error:", membershipError);
    throw new Error("Could not find your home.");
  }

  if (!membership?.home_id) {
    throw new Error("Could not find your home.");
  }

  if (membership.role !== "admin") {
    throw new Error(
      "Only a home admin can run development device simulations."
    );
  }

  return {
    supabase,
    homeId: membership.home_id,
  };
}

async function getAdminHomeAndDevice(deviceId: string) {
  const { supabase, homeId } = await getAdminHome();

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

async function getAdminDeviceIdByName(deviceName: string) {
  const { supabase, homeId } = await getAdminHome();

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
 * Only home admins may run device simulations.
 */
export async function simulateFrontDoorOpen() {
  const deviceId = await getAdminDeviceIdByName("Front Door Sensor");

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
 *
 * Only home admins may run device simulations.
 */
export async function simulateCameraPersonDetection(cameraId: string) {
  if (!cameraId) {
    throw new Error("Camera ID is required.");
  }

  const { device } = await getAdminHomeAndDevice(cameraId);

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