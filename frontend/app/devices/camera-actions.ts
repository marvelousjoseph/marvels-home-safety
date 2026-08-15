"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type AddCameraInput = {
  name: string;
  location: string;
  ipAddress: string;
  port: number;
  username?: string;
  password?: string;
  protocol: string;
  streamPath?: string;
};

type TestCameraInput = {
  deviceId: string;
};

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

  if (membershipError) {
    console.error("Membership lookup error:", membershipError);
    throw new Error("Could not find your home.");
  }

  if (!membership?.home_id) {
    throw new Error("Could not find your home.");
  }

  return {
    supabase,
    user,
    homeId: membership.home_id,
  };
}

/*
 * Add a new camera.
 */
export async function addCamera(input: AddCameraInput) {
  const { supabase, homeId } = await getUserHome();

  /*
   * Validate camera name.
   */
  if (!input.name.trim()) {
    throw new Error("Camera name is required.");
  }

  /*
   * Validate location.
   */
  if (!input.location.trim()) {
    throw new Error("Camera location is required.");
  }

  /*
   * Validate IP address.
   */
  if (!input.ipAddress.trim()) {
    throw new Error("Camera IP address is required.");
  }

  /*
   * Validate port.
   */
  if (
    !Number.isInteger(input.port) ||
    input.port < 1 ||
    input.port > 65535
  ) {
    throw new Error("Camera port must be between 1 and 65535.");
  }

  /*
   * Validate protocol.
   */
  const protocol = input.protocol.trim().toLowerCase();

  if (!["rtsp", "http", "https"].includes(protocol)) {
    throw new Error("Unsupported camera protocol.");
  }

  /*
   * Create the camera device.
   */
  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .insert({
      home_id: homeId,
      name: input.name.trim(),
      type: "Security Camera",
      location: input.location.trim(),
      status: "Offline",
    })
    .select("id")
    .single();

  if (deviceError || !device) {
    console.error("Camera device creation error:", deviceError);

    throw new Error(
      deviceError?.message || "Could not create camera device."
    );
  }

  /*
   * Save the camera network connection.
   */
  const { error: connectionError } = await supabase
    .from("camera_connections")
    .insert({
      home_id: homeId,
      device_id: device.id,
      ip_address: input.ipAddress.trim(),
      port: input.port,
      username: input.username?.trim() || null,
      password: input.password || null,
      protocol,
      stream_path: input.streamPath?.trim() || null,
    });

  /*
   * If saving the connection fails,
   * remove the camera device we just created.
   */
  if (connectionError) {
    console.error(
      "Camera connection creation error:",
      connectionError
    );

    await supabase
      .from("devices")
      .delete()
      .eq("id", device.id)
      .eq("home_id", homeId);

    throw new Error(
      `Could not save camera connection: ${connectionError.message}`
    );
  }

  /*
   * Refresh pages.
   */
  revalidatePath("/devices");
  revalidatePath("/dashboard");
  revalidatePath("/home");

  return {
    success: true,
    deviceId: device.id,
  };
}

/*
 * Test whether a camera has a saved connection configuration.
 *
 * IMPORTANT:
 * This does not attempt to connect directly to the camera from
 * the Next.js server. The actual RTSP/HTTP camera connection
 * service will be added separately.
 *
 * For now it verifies that the camera has the required
 * connection information and marks the device as Online.
 */
export async function testCameraConnection(
  input: TestCameraInput
) {
  const { supabase, homeId } = await getUserHome();

  if (!input.deviceId) {
    throw new Error("Camera device ID is required.");
  }

  /*
   * Make sure the camera belongs to this user's home.
   */
  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select("id, name, type, status")
    .eq("id", input.deviceId)
    .eq("home_id", homeId)
    .eq("type", "Security Camera")
    .limit(1)
    .maybeSingle();

  if (deviceError) {
    console.error("Camera lookup error:", deviceError);
    throw new Error("Could not find the camera.");
  }

  if (!device) {
    throw new Error("Camera not found.");
  }

  /*
   * Get the saved camera connection.
   */
  const { data: connection, error: connectionError } = await supabase
    .from("camera_connections")
    .select(
      "id, ip_address, port, username, protocol, stream_path"
    )
    .eq("device_id", device.id)
    .eq("home_id", homeId)
    .limit(1)
    .maybeSingle();

  if (connectionError) {
    console.error(
      "Camera connection lookup error:",
      connectionError
    );

    throw new Error("Could not load camera connection.");
  }

  if (!connection) {
    throw new Error(
      "No camera connection has been configured for this camera."
    );
  }

  /*
   * Make sure the required network information exists.
   */
  if (!connection.ip_address) {
    throw new Error("Camera IP address is missing.");
  }

  if (!connection.port) {
    throw new Error("Camera port is missing.");
  }

  /*
   * At this stage we have verified the configuration.
   *
   * We are NOT pretending that an RTSP stream is reachable.
   * Actual network connectivity testing will be handled by
   * the CCTV recording/streaming service.
   */
  const { error: updateError } = await supabase
    .from("devices")
    .update({
      status: "Online",
    })
    .eq("id", device.id)
    .eq("home_id", homeId);

  if (updateError) {
    console.error(
      "Camera status update error:",
      updateError
    );

    throw new Error("Could not update camera status.");
  }

  /*
   * Refresh the device page.
   */
  revalidatePath("/devices");
  revalidatePath("/dashboard");
  revalidatePath("/home");

  return {
    success: true,
    message: "Camera connection settings verified.",
    deviceId: device.id,
    ipAddress: connection.ip_address,
    port: connection.port,
    protocol: connection.protocol,
  };
}
