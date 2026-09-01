import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { processDeviceEvent } from "@/lib/process-device-event";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const deviceId = body?.deviceId;

    if (!deviceId) {
      return NextResponse.json(
        { error: "Camera device ID is required." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from("home_members")
      .select("home_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership?.home_id) {
      return NextResponse.json(
        { error: "Could not find your home." },
        { status: 400 }
      );
    }

    const { data: camera, error: cameraError } = await supabase
      .from("devices")
      .select("id, name, type, location, status, home_id")
      .eq("id", deviceId)
      .eq("home_id", membership.home_id)
      .maybeSingle();

    if (cameraError || !camera) {
      return NextResponse.json(
        { error: "Camera not found." },
        { status: 404 }
      );
    }

    if (!camera.type?.toLowerCase().includes("camera")) {
      return NextResponse.json(
        { error: "Selected device is not a camera." },
        { status: 400 }
      );
    }

    /*
     * This event represents the laptop webcam temporarily acting
     * as the selected security camera for MVP testing.
     */
    const result = await processDeviceEvent(
      {
        deviceId: camera.id,
        eventType: "person_detected",
        description: `${camera.name} detected activity during the MVP webcam recording test.`,
      },
      {
        authenticatedUser: true,
      }
    );

    if (!result.recording) {
      return NextResponse.json(
        {
          error:
            "The security event was created, but no recording was created. Make sure the security system is armed and the selected camera is online.",
          eventId: result.event?.id ?? null,
          alertId:
            typeof result.alert?.id === "string"
              ? result.alert.id
              : null,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      recordingId: result.recording.id,
      eventId: result.event.id,
      alertId:
        typeof result.alert?.id === "string"
          ? result.alert.id
          : null,
      cameraId: camera.id,
      cameraName: camera.name,
      location: camera.location,
    });
  } catch (error) {
    console.error("CCTV start error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not start CCTV recording.",
      },
      { status: 500 }
    );
  }
}
