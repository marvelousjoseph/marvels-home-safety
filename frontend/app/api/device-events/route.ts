import { NextResponse } from "next/server";
import { processDeviceEvent } from "@/lib/process-device-event";

export async function POST(request: Request) {
  try {
    const expectedKey = process.env.DEVICE_EVENT_API_KEY;

    if (!expectedKey) {
      console.error("DEVICE_EVENT_API_KEY is not configured.");

      return NextResponse.json(
        { error: "Device API is not configured." },
        { status: 500 }
      );
    }

    const suppliedKey = request.headers.get("x-device-key");

    if (!suppliedKey || suppliedKey !== expectedKey) {
      return NextResponse.json(
        { error: "Unauthorized device." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const deviceId = body.device_id;
    const eventType = body.event_type;
    const description = body.description;

    if (
      typeof deviceId !== "string" ||
      typeof eventType !== "string"
    ) {
      return NextResponse.json(
        {
          error: "device_id and event_type are required.",
        },
        { status: 400 }
      );
    }

    const result = await processDeviceEvent({
      deviceId,
      eventType,
      description:
        typeof description === "string"
          ? description
          : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        event: result.event,
        device: {
          id: result.device.id,
          name: result.device.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Device event API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not process device event.",
      },
      { status: 500 }
    );
  }
}
