import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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
  const value = contentType.toLowerCase();

  if (value.includes("mp4")) {
    return "mp4";
  }

  if (value.includes("webm")) {
    return "webm";
  }

  if (value.includes("ogg")) {
    return "ogg";
  }

  return "webm";
}

export async function POST(request: Request) {
  try {
    /*
     * Authenticate the user using the normal server-side Supabase client.
     */
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        {
          status: 401,
        }
      );
    }

    const formData = await request.formData();

    const recordingId = formData.get("recordingId");
    const video = formData.get("video");

    if (typeof recordingId !== "string" || !recordingId) {
      return NextResponse.json(
        {
          error: "Recording ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!(video instanceof File)) {
      return NextResponse.json(
        {
          error: "Video file is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (video.size === 0) {
      return NextResponse.json(
        {
          error: "The recorded video is empty.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Keep the MVP recording size reasonably small.
     */
    const maxSize = 50 * 1024 * 1024;

    if (video.size > maxSize) {
      return NextResponse.json(
        {
          error: "Recording is too large. Maximum size is 50 MB.",
        },
        {
          status: 413,
        }
      );
    }

    /*
     * Use the service client for database/storage operations.
     *
     * This is server-only and never exposed to the browser.
     */
    const service = createServiceClient();

    /*
     * Determine the authenticated user's home.
     */
    const {
      data: membership,
      error: membershipError,
    } = await service
      .from("home_members")
      .select("home_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership?.home_id) {
      console.error(
        "Could not find user's home:",
        membershipError
      );

      return NextResponse.json(
        {
          error: "Could not find your home.",
        },
        {
          status: 400,
        }
      );
    }

    const homeId = membership.home_id;

    /*
     * Make sure the recording belongs to this home.
     */
    const {
      data: recording,
      error: recordingError,
    } = await service
      .from("security_event_recordings")
      .select(
        "id, home_id, camera_id, status, storage_path, video_url"
      )
      .eq("id", recordingId)
      .eq("home_id", homeId)
      .maybeSingle();

    if (recordingError || !recording) {
      console.error(
        "Recording lookup failed:",
        recordingError
      );

      return NextResponse.json(
        {
          error: "Recording not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Use the same storage layout as /api/cctv/record.
     *
     * Example:
     *
     * home-id/
     *   events/
     *     recording-id/
     *       2026-09-01T10-43-05-548Z.webm
     */
    const extension = getExtension(video.type);

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const storagePath =
      `${homeId}/events/` +
      `${recording.id}/${timestamp}.${extension}`;

    const arrayBuffer = await video.arrayBuffer();

    /*
     * Upload into the PRIVATE security-recordings bucket.
     */
    const {
      error: uploadError,
    } = await service.storage
      .from("security-recordings")
      .upload(storagePath, arrayBuffer, {
        contentType: video.type || "video/webm",
        upsert: false,
      });

    if (uploadError) {
      console.error(
        "CCTV storage upload error:",
        uploadError
      );

      await service
        .from("security_event_recordings")
        .update({
          status: "failed",
        })
        .eq("id", recording.id)
        .eq("home_id", homeId);

      return NextResponse.json(
        {
          error: `Could not upload recording: ${uploadError.message}`,
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Store the REAL Storage object path.
     *
     * video_url is also kept as the path for compatibility with
     * the existing database structure.
     *
     * The application pages generate temporary signed URLs when
     * the user actually views the recording.
     */
    const now = new Date().toISOString();

    const {
      error: updateError,
    } = await service
      .from("security_event_recordings")
      .update({
        storage_path: storagePath,
        video_url: storagePath,
        status: "ready",
        ended_at: now,
      })
      .eq("id", recording.id)
      .eq("home_id", homeId);

    if (updateError) {
      console.error(
        "Recording database update error:",
        updateError
      );

      /*
       * The database update failed after the file was uploaded.
       * Marking the recording failed prevents the UI from treating
       * it as a completed recording.
       */
      await service
        .from("security_event_recordings")
        .update({
          status: "failed",
        })
        .eq("id", recording.id)
        .eq("home_id", homeId);

      return NextResponse.json(
        {
          error: `Recording uploaded but database update failed: ${updateError.message}`,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      recordingId: recording.id,
      storagePath,
      status: "ready",
    });
  } catch (error) {
    console.error(
      "CCTV upload route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not upload CCTV recording.",
      },
      {
        status: 500,
      }
    );
  }
}
