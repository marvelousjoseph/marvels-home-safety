import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

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

  const deviceQuery = supabase
    .from("devices")
    .select("id, name, status, home_id")
    .eq("id", deviceId)
    .maybeSingle();

  const { data: device, error: deviceError } = await deviceQuery;

  if (deviceError || !device) {
    throw new Error("Device not found.");
  }

  if (homeId && device.home_id !== homeId) {
    throw new Error("Device does not belong to your home.");
  }

  homeId = device.home_id;

  if (!homeId) {
    throw new Error("Device is not associated with a home.");
  }

  const { data: event, error: eventError } = await supabase
    .from("device_events")
    .insert({
      home_id: homeId,
      device_id: device.id,
      event_type: eventType,
      description:
        description || `${device.name} reported ${eventType}.`,
    })
    .select()
    .single();

  if (eventError) {
    console.error("Device event error:", eventError);
    throw new Error("Could not create device event.");
  }

  const { data: securityStatus, error: securityError } =
    await supabase
      .from("security_status")
      .select("armed")
      .eq("home_id", homeId)
      .maybeSingle();

  if (securityError) {
    console.error("Security status error:", securityError);
    throw new Error("Could not check security status.");
  }

  if (
    securityStatus?.armed === true &&
    eventType === "door_opened"
  ) {
    const { error: alertError } = await supabase
      .from("alerts")
      .insert({
        home_id: homeId,
        title: `${device.name} Opened`,
        description:
          description ||
          `${device.name} detected that the door was opened while the security system was armed.`,
        severity: "high",
        resolved: false,
      });

    if (alertError) {
      console.error("Alert creation error:", alertError);
      throw new Error("Could not create security alert.");
    }
  }

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
  };
}
