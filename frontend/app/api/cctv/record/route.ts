import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { processDeviceEvent } from "@/lib/process-device-event";

export const runtime = "nodejs";

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

function getExtension(contentType: string) {
  if (contentType.includes("mp4")) return "mp4";
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("ogg")) return "ogg";
  return "webm";
}

export async function POST(request: Request) {
  try {
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

    const formData = await request.formData();

    const video = formData.get("video");
    const deviceId = String(formData.get("deviceId") || "");

    if (!(video instanceof File)) {
      return NextResponse.json(
        { error: "No video recording was supplied." },
        { status: 400 }
      );
    }

    if (!deviceId) {
      return NextResponse.json(
        { error: "Camera device ID is required." },
        { status: 400 }
      );
    }

    if (video.size === 0) {
      return NextResponse.json(
        { error: "The recording is empty." },
        { status: 400 }
      );
    }

    const service = createServiceClient();

    /*
     * Confirm the camera belongs to the authenticated user's home.
     */
    const { data: membership, error: membershipError } = await service
      .from("home_members")
      .select("home_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership?.home_id) {
      return NextResponse.json(
        { error: "Could not find your home." },
        { status: 403 }
      );
    }

    const homeId = membership.home_id;

    const { data: camera, error: cameraError } = await service
      .from("devices")
      .select("id, name, type, location, status, home_id")
      .eq("id", deviceId)
      .eq("home_id", homeId)
      .maybeSingle();

    if (cameraError || !camera) {
      return NextResponse.json(
        { error: "Camera was not found." },
        { status: 404 }
      );
    }

    if (!camera.type.toLowerCase().includes("camera")) {
      return NextResponse.json(
        { error: "Selected device is not a camera." },
        { status: 400 }
      );
    }

    /*
     * Create the actual security event.
     *
     * processDeviceEvent() will:
     * - create device_events
     * - create an alert
     * - resolve this exact camera
     * - create security_event_recordings with status=pending
     */
    const result = await processDeviceEvent({
      deviceId: camera.id,
      eventType: "person_detected",
      description: `Test webcam security event recorded from ${camera.name}.`,
    });

    if (!result.recording) {
      return NextResponse.json(
        {
          error:
            "The security event was created, but no recording row was created. Check that the camera is online.",
        },
        { status: 409 }
      );
    }

    const recordingId = String(result.recording.id);
    const extension = getExtension(video.type);

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const storagePath =
      `${homeId}/events/${recordingId}/${timestamp}.${extension}`;

    const arrayBuffer = await video.arrayBuffer();

    /*
     * Upload the browser recording into the private bucket.
     */
    const { error: uploadError } = await service.storage
      .from("security-recordings")
      .upload(storagePath, arrayBuffer, {
        contentType: video.type || "video/webm",
        upsert: false,
      });

    if (uploadError) {
      console.error("CCTV storage upload error:", uploadError);

      await service
        .from("security_event_recordings")
        .update({
          status: "failed",
        })
        .eq("id", recordingId)
        .eq("home_id", homeId);

      return NextResponse.json(
        { error: `Could not upload recording: ${uploadError.message}` },
        { status: 500 }
      );
    }

    /*
     * Keep video_url as the storage path.
     *
     * Because the bucket is private, we generate signed URLs
     * when the recording is viewed rather than storing a public URL.
     */
    const { error: recordingUpdateError } = await service
      .from("security_event_recordings")
      .update({
        storage_path: storagePath,
        video_url: storagePath,
        status: "ready",
        ended_at: new Date().toISOString(),
      })
      .eq("id", recordingId)
      .eq("home_id", homeId);

    if (recordingUpdateError) {
      console.error(
        "Recording database update error:",
        recordingUpdateError
      );

      return NextResponse.json(
        {
          error: `Recording uploaded but database update failed: ${recordingUpdateError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recordingId,
      camera: {
        id: camera.id,
        name: camera.name,
        location: camera.location,
      },
      storagePath,
      status: "ready",
    });
  } catch (error) {
    console.error("CCTV recording route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "CCTV recording failed.",
      },
      { status: 500 }
    );
  }
}
