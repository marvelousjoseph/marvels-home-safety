import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { classifySecurityEvent } from "@/lib/classify-security-event";

type DeviceEventInput = {
  deviceId: string;
  eventType: string;
  description?: string;
};

type ProcessOptions = {
  authenticatedUser?: boolean;
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

export async function processDeviceEvent(
  {
    deviceId,
    eventType,
    description,
  }: DeviceEventInput,
  options: ProcessOptions = {}
) {
  const supabase = options.authenticatedUser
    ? await createSupabaseServerClient()
    : createServiceClient();

  let homeId: string | null = null;

  /*
   * Browser/user path
   */
  if (options.authenticatedUser) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in.");
    }

    const { data: membership, error: membershipError } =
      await supabase
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
    .select("id, name, type, status, home_id")
    .eq("id", deviceId)
    .maybeSingle();

  if (deviceError || !device) {
    throw new Error("Device not found.");
  }

  /*
   * Browser users may only interact with
   * devices belonging to their home.
   */
  if (homeId && device.home_id !== homeId) {
    throw new Error("Device does not belong to your home.");
  }

  homeId = device.home_id;

  if (!homeId) {
    throw new Error("Device is not associated with a home.");
  }

  /*
   * Check security status.
   */
  const { data: securityStatus, error: securityError } =
    await supabase
      .from("security_status")
      .select("armed")
      .eq("home_id", homeId)
      .maybeSingle();

  if (securityError) {
    throw new Error("Could not check security status.");
  }

  const armed = securityStatus?.armed === true;

  /*
   * Intelligent event classification.
   */
  const classification = classifySecurityEvent({
    deviceName: device.name,
    deviceType: device.type,
    eventType,
    securityArmed: armed,
  });

  /*
   * Store the physical device event.
   */
  const { data: event, error: eventError } = await supabase
    .from("device_events")
    .insert({
      home_id: homeId,
      device_id: device.id,
      event_type: eventType,
      description:
        description || classification.description,
    })
    .select()
    .single();

  if (eventError) {
    console.error("Device event error:", eventError);
    throw new Error("Could not create device event.");
  }

  /*
   * Create security alert when the classifier
   * determines that the event requires one.
   */
  if (classification.shouldAlert) {
    const { error: alertError } = await supabase
      .from("alerts")
      .insert({
        home_id: homeId,
        title: classification.title,
        description:
          description || classification.description,
        severity: classification.severity,
        resolved: false,
      });

    if (alertError) {
      console.error("Alert creation error:", alertError);
      throw new Error("Could not create security alert.");
    }
  }

  /*
   * Device successfully reported an event,
   * therefore mark it online.
   */
  const { error: deviceStatusError } = await supabase
    .from("devices")
    .update({ status: "Online" })
    .eq("id", device.id)
    .eq("home_id", homeId);

  if (deviceStatusError) {
    console.error("Device status error:", deviceStatusError);
    throw new Error("Could not update device status.");
  }

  return {
    event,
    device,
    classification,
  };
}
