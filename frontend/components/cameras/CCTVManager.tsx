"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

type PendingRecording = {
  id: string;
  camera_id: string | null;
  status: string | null;
};

const RECORDING_DURATION_MS = 30_000;
const VIDEO_BITRATE = 1_500_000;

const PROTECTED_PATHS = [
  "/dashboard",
  "/home",
  "/security",
  "/alerts",
  "/devices",
  "/activity",
  "/notifications",
  "/recordings",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );
}

function getSupportedMimeType() {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];

  return (
    candidates.find((type) =>
      MediaRecorder.isTypeSupported(type)
    ) || ""
  );
}

export default function CCTVManager() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<
    typeof supabase.channel
  > | null>(null);

  const queueRef = useRef<PendingRecording[]>([]);
  const queuedIdsRef = useRef(new Set<string>());
  const processingRef = useRef(false);
  const currentRecorderRef = useRef<MediaRecorder | null>(null);
  const currentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const homeIdRef = useRef<string | null>(null);

  const stopStream = () => {
    if (currentTimerRef.current) {
      clearTimeout(currentTimerRef.current);
      currentTimerRef.current = null;
    }

    const recorder = currentRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    currentRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const cleanupRealtime = async () => {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  const queueRecording = (recording: PendingRecording) => {
    if (
      recording.status !== "pending" ||
      queuedIdsRef.current.has(recording.id)
    ) {
      return;
    }

    queuedIdsRef.current.add(recording.id);
    queueRef.current.push(recording);

    void processQueue();
  };

  const uploadRecording = async (
    recordingId: string,
    blob: Blob
  ) => {
    const extension = blob.type.includes("webm")
      ? "webm"
      : "webm";

    const formData = new FormData();

    formData.append("recordingId", recordingId);

    formData.append(
      "video",
      blob,
      `security-${recordingId}-${Date.now()}.${extension}`
    );

    const response = await fetch("/api/cctv/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text();

      throw new Error(
        `CCTV upload failed (${response.status}): ${message}`
      );
    }
  };

  const recordPendingEvent = async (
    recording: PendingRecording
  ) => {
    const stream = streamRef.current;

    if (!stream) {
      throw new Error("CCTV camera stream is unavailable.");
    }

    if (!stream.active) {
      throw new Error("CCTV camera stream is no longer active.");
    }

    if (recording.status !== "pending") {
      return;
    }

    const mimeType = getSupportedMimeType();

    const recorder = mimeType
      ? new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: VIDEO_BITRATE,
        })
      : new MediaRecorder(stream, {
          videoBitsPerSecond: VIDEO_BITRATE,
        });

    currentRecorderRef.current = recorder;

    const chunks: BlobPart[] = [];

    const recordingPromise = new Promise<Blob>(
      (resolve, reject) => {
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onerror = () => {
          reject(new Error("CCTV MediaRecorder failed."));
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, {
            type: recorder.mimeType || mimeType || "video/webm",
          });

          resolve(blob);
        };
      }
    );

    recorder.start(1000);

    currentTimerRef.current = setTimeout(() => {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    }, RECORDING_DURATION_MS);

    const blob = await recordingPromise;

    if (currentTimerRef.current) {
      clearTimeout(currentTimerRef.current);
      currentTimerRef.current = null;
    }

    currentRecorderRef.current = null;

    if (blob.size === 0) {
      throw new Error("CCTV recording produced an empty video.");
    }

    await uploadRecording(recording.id, blob);
  };

  const processQueue = async () => {
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;

    try {
      while (queueRef.current.length > 0) {
        const recording = queueRef.current.shift();

        if (!recording) {
          continue;
        }

        try {
          await recordPendingEvent(recording);
        } catch (error) {
          console.error(
            `Automatic CCTV recording failed for ${recording.id}:`,
            error
          );
        } finally {
          queuedIdsRef.current.delete(recording.id);
        }
      }
    } finally {
      processingRef.current = false;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      const pathname = window.location.pathname;

      if (!isProtectedPath(pathname)) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        return;
      }

      const { data: membership, error: membershipError } =
        await supabase
          .from("home_members")
          .select("home_id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

      if (
        membershipError ||
        !membership?.home_id ||
        cancelled
      ) {
        console.error(
          "Could not initialize CCTV home:",
          membershipError
        );
        return;
      }

      homeIdRef.current = membership.home_id;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (error) {
        console.error(
          "Marvels Home Safety CCTV camera could not start:",
          error
        );
        return;
      }

      const channel = supabase
        .channel(`security-recordings-${membership.home_id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "security_event_recordings",
            filter: `home_id=eq.${membership.home_id}`,
          },
          (payload) => {
            const recording =
              payload.new as PendingRecording;

            if (recording.status === "pending") {
              queueRecording(recording);
            }
          }
        )
        .subscribe();

      channelRef.current = channel;

      const { data: pending, error: pendingError } =
        await supabase
          .from("security_event_recordings")
          .select("id, camera_id, status")
          .eq("home_id", membership.home_id)
          .eq("status", "pending")
          .order("created_at", { ascending: true });

      if (pendingError) {
        console.error(
          "Could not load pending CCTV recordings:",
          pendingError
        );
        return;
      }

      if (pending) {
        pending.forEach((recording) => {
          if (!cancelled) {
            queueRecording(recording);
          }
        });
      }
    };

    void initialize();

    return () => {
      cancelled = true;

      void cleanupRealtime();

      queueRef.current = [];
      queuedIdsRef.current.clear();

      stopStream();

      homeIdRef.current = null;
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      aria-hidden="true"
      className="hidden"
    />
  );
}
