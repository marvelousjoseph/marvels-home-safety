import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { classifySecurityEvent } from "@/lib/classify-security-event";
import { createSecurityNotifications } from "@/lib/create-security-notification";

type DeviceEventInput = {
  deviceId: string;
  eventType: string;
  description?: string;
};

type ProcessOptions = {
  authenticatedUser?: boolean;
};

type DeviceForRecording = {
  id: string;
  name: string;
  type: string;
  location: string | null;
  status: string | null;
};

type CreateEventRecordingInput = {
  homeId: string;
  device: DeviceForRecording;
  deviceEventId: string;
  alertId: string | null;
};

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Finds the camera responsible for a device event.
 *
 * Camera events:
 *   The camera itself is responsible for the recording.
 *
 * Sensor events:
 *   camera_coverage determines which camera covers the
 *   sensor's location.
 *
 * This prevents one camera from being used as a generic
 * camera for unrelated areas.
 */
async function findEventCamera(
  homeId: string,
  device: DeviceForRecording
) {
  const supabase = createServiceClient();

  const deviceType = device.type.toLowerCase();

  /*
   * If the event originated from a camera, that exact
   * camera is responsible for its own event.
   */
  if (deviceType.includes("camera")) {
    return device;
  }

  /*
   * Sensors without a location cannot be mapped to a
   * camera through camera_coverage.
   */
  if (!device.location) {
    return null;
  }

  /*
   * Look up the camera assignment through camera_coverage.
   *
   * We deliberately do NOT search the devices table by
   * location anymore.
   */
  const { data: coverage, error: coverageError } = await supabase
    .from("camera_coverage")
    .select("camera_id, location")
    .eq("home_id", homeId)
    .eq("location", device.location)
    .limit(1)
    .maybeSingle();

  if (coverageError) {
    console.error("Camera coverage lookup error:", coverageError);

    throw new Error(
      `Could not find camera coverage: ${coverageError.message}`
    );
  }

  /*
   * No camera has been assigned to this location.
   *
   * The sensor event and alert can still work without
   * a recording.
   */
  if (!coverage?.camera_id) {
    return null;
  }

  /*
   * Fetch the actual camera device.
   */
  const { data: camera, error: cameraError } = await supabase
    .from("devices")
    .select("id, name, type, location, status")
    .eq("id", coverage.camera_id)
    .eq("home_id", homeId)
    .maybeSingle();

  if (cameraError) {
    console.error("Assigned camera lookup error:", cameraError);

    throw new Error(
      `Could not find assigned camera: ${cameraError.message}`
    );
  }

  if (!camera) {
    return null;
  }

  return camera;
}

/**
 * Creates a pending CCTV recording record only when the
 * responsible camera is actually online.
 */
async function createEventRecording({
  homeId,
  device,
  deviceEventId,
  alertId,
}: CreateEventRecordingInput) {
  const camera = await findEventCamera(homeId, device);

  /*
   * No assigned camera.
   *
   * The security event and alert still exist, but there
   * is no recording because no camera covers the location.
   */
  if (!camera) {
    console.log(
      `No camera assigned to ${device.location ?? "this event location"}.`
    );

    return null;
  }

  /*
   * Only an online camera can create a recording.
   */
  if (camera.status?.toLowerCase() !== "online") {
    console.log(
      `Camera "${camera.name}" is offline. No recording created.`
    );

    return null;
  }

  /*
   * Make sure the assigned device is actually a camera.
   */
  if (!camera.type.toLowerCase().includes("camera")) {
    console.error(
      `Device "${camera.name}" is assigned as a camera but has type "${camera.type}".`
    );

    return null;
  }

  const supabase = createServiceClient();

  const { data: recording, error } = await supabase
    .from("security_event_recordings")
    .insert({
      home_id: homeId,
      device_event_id: deviceEventId,
      alert_id: alertId,
      camera_id: camera.id,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Recording creation error:", error);

    throw new Error(
      `Could not create security event recording: ${error.message}`
    );
  }

  return recording;
}

export async function processDeviceEvent(
  {
    deviceId,
    eventType,
    description,
  }: DeviceEventInput,
  options: ProcessOptions = {}
) {
  /*
   * Normal authenticated operations use the user's server
   * session.
   *
   * Device integrations use the trusted service client.
   */
  const supabase = options.authenticatedUser
    ? await createSupabaseServerClient()
    : createServiceClient();

  let homeId: string | null = null;

  /*
   * Verify the authenticated user's home.
   */
  if (options.authenticatedUser) {
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

    homeId = membership.home_id;
  }

  /*
   * Find the device that generated the event.
   */
  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select("id, name, type, status, location, home_id")
    .eq("id", deviceId)
    .maybeSingle();

  if (deviceError || !device) {
    throw new Error("Device not found.");
  }

  /*
   * Prevent authenticated users from triggering events
   * for another home.
   */
  if (homeId && device.home_id !== homeId) {
    throw new Error("Device does not belong to your home.");
  }

  homeId = device.home_id;

  if (!homeId) {
    throw new Error("Device is not associated with a home.");
  }

  /*
   * Check whether the home's security system is armed.
   */
  const { data: securityStatus, error: securityError } = await supabase
    .from("security_status")
    .select("armed")
    .eq("home_id", homeId)
    .maybeSingle();

  if (securityError) {
    throw new Error(
      `Could not check security status: ${securityError.message}`
    );
  }

  const armed = securityStatus?.armed === true;

  /*
   * Classify the incoming event.
   */
  const classification = classifySecurityEvent({
    deviceName: device.name,
    deviceType: device.type,
    eventType,
    securityArmed: armed,
  });

  /*
   * Always store the underlying device event.
   */
  const { data: event, error: eventError } = await supabase
    .from("device_events")
    .insert({
      home_id: homeId,
      device_id: device.id,
      event_type: eventType,
      description: description || classification.description,
    })
    .select()
    .single();

  if (eventError) {
    console.error("Device event error:", eventError);

    throw new Error(
      `Could not create device event: ${eventError.message}`
    );
  }

  let alert: Record<string, unknown> | null = null;
  let notifications: unknown[] = [];
  let recording: Record<string, unknown> | null = null;

  /*
   * Security-alert-worthy events create:
   *
   * 1. Alert
   * 2. Notifications
   * 3. Recording only if the responsible camera
   *    exists and is online.
   */
  if (classification.shouldAlert) {
    const { data: createdAlert, error: alertError } = await supabase
      .from("alerts")
      .insert({
        home_id: homeId,
        title: classification.title,
        description: description || classification.description,
        severity: classification.severity,
        resolved: false,
      })
      .select()
      .single();

    if (alertError) {
      console.error("Alert creation error:", alertError);

      throw new Error(
        `Could not create security alert: ${alertError.message}`
      );
    }

    alert = createdAlert;

    notifications = await createSecurityNotifications({
      homeId,
      alertId: createdAlert.id,
      title: classification.title,
      message: description || classification.description,
    });

    /*
     * Resolve the correct camera through camera_coverage
     * and create a recording only when that camera is online.
     */
    recording = await createEventRecording({
      homeId,
      device: {
        id: device.id,
        name: device.name,
        type: device.type,
        location: device.location,
        status: device.status,
      },
      deviceEventId: event.id,
      alertId: createdAlert.id,
    });
  }

  /*
   * A successfully reporting device is online.
   */
  const { error: deviceStatusError } = await supabase
    .from("devices")
    .update({ status: "Online" })
    .eq("id", device.id)
    .eq("home_id", homeId);

  if (deviceStatusError) {
    console.error("Device status error:", deviceStatusError);

    throw new Error(
      `Could not update device status: ${deviceStatusError.message}`
    );
  }

  return {
    event,
    device,
    classification,
    alert,
    notifications,
    recording,
  };
}
