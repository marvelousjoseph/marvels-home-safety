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

type SecuritySupabaseClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

type DeviceForRecording = {
  id: string;
  name: string;
  type: string;
  location: string | null;
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
 * Creates a pending CCTV recording record.
 *
 * IMPORTANT:
 * This uses the trusted server-side Supabase client.
 * Users never insert recording records directly.
 */
async function createEventRecording({
  homeId,
  device,
  deviceEventId,
  alertId,
}: CreateEventRecordingInput) {
  /*
   * Use the server secret client here because this is a
   * trusted server-side operation.
   *
   * This bypasses normal RLS checks without disabling RLS.
   */
  const supabase = createServiceClient();

  const deviceType = device.type.toLowerCase();

  /*
   * If the event came directly from a camera,
   * associate the recording with that camera.
   */
  if (deviceType.includes("camera")) {
    const { data: recording, error } = await supabase
      .from("security_event_recordings")
      .insert({
        home_id: homeId,
        device_event_id: deviceEventId,
        alert_id: alertId,
        camera_id: device.id,
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

  /*
   * For sensors such as doors or smoke detectors,
   * find a camera covering the same location.
   */
  if (!device.location) {
    return null;
  }

  const { data: cameras, error: cameraError } = await supabase
    .from("devices")
    .select("id, name, type, location")
    .eq("home_id", homeId)
    .ilike("type", "%camera%")
    .eq("location", device.location)
    .limit(1);

  if (cameraError) {
    console.error("Camera lookup error:", cameraError);

    throw new Error(
      `Could not find the event camera: ${cameraError.message}`
    );
  }

  const camera = cameras?.[0] ?? null;

  /*
   * No camera covers this location.
   * The security event and alert still work.
   */
  if (!camera) {
    return null;
  }

  const { data: recording, error: recordingError } = await supabase
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

  if (recordingError) {
    console.error("Recording creation error:", recordingError);

    throw new Error(
      `Could not create security event recording: ${recordingError.message}`
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
   * Normal authenticated operations use the user's server session.
   * Device integrations can use the service client.
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
   * Find the device.
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
   * Prevent an authenticated user from triggering
   * events for another home.
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
   * 3. CCTV recording placeholder
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
     * Create the pending CCTV recording.
     *
     * This function uses the trusted server client,
     * so the user's RLS SELECT policy remains intact.
     */
    recording = await createEventRecording({
      homeId,
      device: {
        id: device.id,
        name: device.name,
        type: device.type,
        location: device.location,
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
