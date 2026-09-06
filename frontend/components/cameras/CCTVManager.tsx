"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useCCTV } from "@/components/cameras/CCTVContext";

type PendingRecording = {
  id: string;
  camera_id: string | null;
  status: string | null;
};

const RECORDING_DURATION_MS = 30_000;
const VIDEO_BITRATE = 1_500_000;

const DEVELOPMENT_CAMERA_ID =
  "33f18217-83ed-43e0-ade2-c84f833403f0";

/*
 * Camera startup can occasionally fail while the browser,
 * operating system, or webcam is still initializing.
 *
 * Retry automatically instead of requiring a page refresh.
 */
const CAMERA_RETRY_DELAYS_MS = [
  0,
  1000,
  2000,
  3000,
  5000,
];

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

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getErrorName(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "name" in error
  ) {
    return String(
      (error as { name?: unknown }).name || ""
    );
  }

  return "";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    return String(
      (error as { message?: unknown }).message || ""
    );
  }

  return String(error);
}

export default function CCTVManager() {
  const { setStream, setSourceCameraId } = useCCTV();

  const streamRef =
    useRef<MediaStream | null>(null);

  const channelRef = useRef<ReturnType<
    typeof supabase.channel
  > | null>(null);

  const queueRef = useRef<PendingRecording[]>([]);
  const queuedIdsRef =
    useRef(new Set<string>());

  const processingRef =
    useRef(false);

  const currentRecorderRef =
    useRef<MediaRecorder | null>(null);

  const currentTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const homeIdRef =
    useRef<string | null>(null);

  const initializedRef =
    useRef(false);

  const initializingRef =
    useRef(false);

  const mountedRef =
    useRef(false);

  const delayedCleanupRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  /*
   * Stop the physical webcam and active recorder.
   */
  const stopStream = () => {
    if (currentTimerRef.current) {
      clearTimeout(currentTimerRef.current);
      currentTimerRef.current = null;
    }

    const recorder =
      currentRecorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      try {
        recorder.stop();
      } catch {
        // Recorder may already be stopping.
      }
    }

    currentRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          try {
            track.stop();
          } catch {
            // Ignore already-stopped tracks.
          }
        });

      streamRef.current = null;
    }

    setSourceCameraId(null);
    setStream(null);
  };

  /*
   * Remove the Supabase realtime channel.
   */
  const cleanupRealtime = async () => {
    if (!channelRef.current) {
      return;
    }

    const channel =
      channelRef.current;

    channelRef.current = null;

    await supabase.removeChannel(channel);
  };

  /*
   * Put a pending security recording into
   * the automatic recording queue.
   */
  const queueRecording = (
    recording: PendingRecording
  ) => {
    if (
      recording.status !== "pending" ||
      queuedIdsRef.current.has(recording.id)
    ) {
      return;
    }

    queuedIdsRef.current.add(
      recording.id
    );

    queueRef.current.push(recording);

    void processQueue();
  };

  /*
   * Upload the finished recording through
   * the existing secure server endpoint.
   */
  const uploadRecording = async (
    recordingId: string,
    blob: Blob
  ) => {
    const formData = new FormData();

    formData.append(
      "recordingId",
      recordingId
    );

    formData.append(
      "video",
      blob,
      `security-${recordingId}-${Date.now()}.webm`
    );

    const response = await fetch(
      "/api/cctv/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const message =
        await response.text();

      throw new Error(
        `CCTV upload failed (${response.status}): ${message}`
      );
    }
  };

  /*
   * Record one automatically-created
   * security event for 30 seconds.
   */
  const recordPendingEvent = async (
    recording: PendingRecording
  ) => {
    const stream =
      streamRef.current;

    if (
      !stream ||
      !stream.active
    ) {
      throw new Error(
        "CCTV camera stream is unavailable."
      );
    }

    if (
      recording.status !== "pending"
    ) {
      return;
    }

    const mimeType =
      getSupportedMimeType();

    let recorder: MediaRecorder;

    try {
      recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond:
              VIDEO_BITRATE,
          })
        : new MediaRecorder(stream, {
            videoBitsPerSecond:
              VIDEO_BITRATE,
          });
    } catch (error) {
      throw new Error(
        `Could not create CCTV recorder: ${getErrorMessage(
          error
        )}`
      );
    }

    currentRecorderRef.current =
      recorder;

    const chunks: BlobPart[] = [];

    const recordingPromise =
      new Promise<Blob>(
        (resolve, reject) => {
          recorder.ondataavailable = (
            event
          ) => {
            if (
              event.data.size > 0
            ) {
              chunks.push(
                event.data
              );
            }
          };

          recorder.onerror = () => {
            reject(
              new Error(
                "CCTV MediaRecorder failed."
              )
            );
          };

          recorder.onstop = () => {
            resolve(
              new Blob(chunks, {
                type:
                  recorder.mimeType ||
                  mimeType ||
                  "video/webm",
              })
            );
          };
        }
      );

    try {
      recorder.start(1000);
    } catch (error) {
      currentRecorderRef.current =
        null;

      throw new Error(
        `CCTV recording could not start: ${getErrorMessage(
          error
        )}`
      );
    }

    currentTimerRef.current =
      setTimeout(() => {
        if (
          recorder.state !==
          "inactive"
        ) {
          try {
            recorder.stop();
          } catch {
            // Ignore a recorder that has
            // already stopped.
          }
        }
      }, RECORDING_DURATION_MS);

    const blob =
      await recordingPromise;

    if (
      currentTimerRef.current
    ) {
      clearTimeout(
        currentTimerRef.current
      );

      currentTimerRef.current =
        null;
    }

    currentRecorderRef.current =
      null;

    if (blob.size === 0) {
      throw new Error(
        "CCTV recording produced an empty video."
      );
    }

    await uploadRecording(
      recording.id,
      blob
    );
  };

  /*
   * Process automatic recordings one at a time.
   */
  const processQueue = async () => {
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;

    try {
      while (
        queueRef.current.length > 0
      ) {
        const recording =
          queueRef.current.shift();

        if (!recording) {
          continue;
        }

        try {
          await recordPendingEvent(
            recording
          );
        } catch (error) {
          console.error(
            `Automatic CCTV recording failed for ${recording.id}:`,
            error
          );
        } finally {
          queuedIdsRef.current.delete(
            recording.id
          );
        }
      }
    } finally {
      processingRef.current =
        false;
    }
  };

  /*
   * Start the real laptop webcam.
   *
   * This function retries automatically when
   * the browser temporarily cannot initialize
   * the camera.
   */
  const startCameraWithRetry = async (
    cancelled: () => boolean
  ) => {
    if (
      streamRef.current?.active
    ) {
      setSourceCameraId(
        DEVELOPMENT_CAMERA_ID
      );

      setStream(
        streamRef.current
      );

      return true;
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      console.error(
        "This browser does not support webcam access."
      );

      return false;
    }

    for (
      let attempt = 0;
      attempt <
      CAMERA_RETRY_DELAYS_MS.length;
      attempt++
    ) {
      if (cancelled()) {
        return false;
      }

      const delay =
        CAMERA_RETRY_DELAYS_MS[
          attempt
        ];

      if (delay > 0) {
        console.log(
          `CCTV camera retry ${attempt}/${CAMERA_RETRY_DELAYS_MS.length - 1} in ${delay}ms...`
        );

        await wait(delay);

        if (cancelled()) {
          return false;
        }
      }

      try {
        /*
         * Use a clean camera request.
         *
         * The video element is NOT involved here.
         * The resulting MediaStream is shared
         * through CCTVContext and can also be
         * passed directly to MediaRecorder.
         */
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
                },
                frameRate: {
                  ideal: 30,
                },
              },
              audio: false,
            }
          );

        if (
          cancelled()
        ) {
          stream
            .getTracks()
            .forEach((track) => {
              try {
                track.stop();
              } catch {
                // Ignore cleanup errors.
              }
            });

          return false;
        }

        const videoTracks =
          stream.getVideoTracks();

        const hasLiveVideo =
          videoTracks.some(
            (track) =>
              track.readyState ===
              "live"
          );

        if (
          !stream.active ||
          !hasLiveVideo
        ) {
          stream
            .getTracks()
            .forEach((track) => {
              try {
                track.stop();
              } catch {
                // Ignore cleanup errors.
              }
            });

          throw new Error(
            "Camera stream was created but no live video track is available."
          );
        }

        streamRef.current =
          stream;

        /*
         * The development laptop webcam
         * represents the Living Room Camera.
         */
        setSourceCameraId(
          DEVELOPMENT_CAMERA_ID
        );

        setStream(stream);

        /*
         * If the physical webcam stops later,
         * clear the shared state so the UI knows
         * the camera is no longer available.
         */
        videoTracks.forEach(
          (track) => {
            track.addEventListener(
              "ended",
              () => {
                if (
                  streamRef.current ===
                  stream
                ) {
                  console.warn(
                    "Marvels Home Safety CCTV camera stopped."
                  );

                  streamRef.current =
                    null;

                  setSourceCameraId(
                    null
                  );

                  setStream(null);
                }
              }
            );
          }
        );

        console.log(
          "Marvels Home Safety CCTV camera is live."
        );

        return true;
      } catch (error) {
        const errorName =
          getErrorName(error);

        const errorMessage =
          getErrorMessage(error);

        console.warn(
          `CCTV camera startup attempt ${
            attempt + 1
          } failed:`,
          errorName,
          errorMessage
        );

        /*
         * Permission errors normally cannot be
         * fixed by repeatedly requesting access.
         */
        if (
          errorName ===
          "NotAllowedError"
        ) {
          console.error(
            "CCTV camera permission was denied or blocked."
          );

          return false;
        }

        /*
         * AbortError, NotReadableError,
         * InvalidStateError, and temporary
         * hardware startup failures are allowed
         * to retry automatically.
         */
      }
    }

    console.error(
      "CCTV camera could not be started after automatic retries."
    );

    setSourceCameraId(null);
    setStream(null);

    return false;
  };

  useEffect(() => {
    mountedRef.current = true;

    if (
      delayedCleanupRef.current
    ) {
      clearTimeout(
        delayedCleanupRef.current
      );

      delayedCleanupRef.current =
        null;
    }

    let cancelled = false;

    const initialize = async () => {
      if (
        cancelled ||
        !mountedRef.current ||
        initializedRef.current ||
        initializingRef.current
      ) {
        return;
      }

      initializingRef.current =
        true;

      try {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (
          cancelled ||
          !mountedRef.current
        ) {
          return;
        }

        if (!user) {
          return;
        }

        const {
          data: membership,
          error: membershipError,
        } =
          await supabase
            .from("home_members")
            .select("home_id")
            .eq(
              "user_id",
              user.id
            )
            .limit(1)
            .maybeSingle();

        if (
          membershipError ||
          !membership?.home_id
        ) {
          console.error(
            "Could not initialize CCTV home:",
            membershipError
          );

          return;
        }

        if (
          cancelled ||
          !mountedRef.current
        ) {
          return;
        }

        homeIdRef.current =
          membership.home_id;

        /*
         * Start the one real physical CCTV
         * source with automatic retries.
         */
        const cameraStarted =
          await startCameraWithRetry(
            () => cancelled
          );

        if (
          cancelled ||
          !mountedRef.current
        ) {
          return;
        }

        if (!cameraStarted) {
          console.warn(
            "CCTV camera is currently unavailable. Security event processing will continue without camera recording until the camera becomes available."
          );
        }

        /*
         * Register realtime BEFORE subscribe().
         */
        if (
          !channelRef.current
        ) {
          const channel =
            supabase
              .channel(
                `security-recordings-${membership.home_id}`
              )
              .on(
                "postgres_changes",
                {
                  event: "INSERT",
                  schema: "public",
                  table:
                    "security_event_recordings",
                  filter: `home_id=eq.${membership.home_id}`,
                },
                (payload) => {
                  const recording =
                    payload.new as PendingRecording;

                  if (
                    recording.status ===
                    "pending"
                  ) {
                    queueRecording(
                      recording
                    );
                  }
                }
              );

          channelRef.current =
            channel;

          channel.subscribe(
            (status) => {
              console.log(
                "CCTV Realtime status:",
                status
              );
            }
          );
        }

        /*
         * Load pending recordings that
         * existed before initialization.
         */
        const {
          data: pending,
          error: pendingError,
        } =
          await supabase
            .from(
              "security_event_recordings"
            )
            .select(
              "id, camera_id, status"
            )
            .eq(
              "home_id",
              membership.home_id
            )
            .eq(
              "status",
              "pending"
            )
            .order(
              "created_at",
              {
                ascending: true,
              }
            );

        if (
          pendingError
        ) {
          console.error(
            "Could not load pending CCTV recordings:",
            pendingError
          );
        } else {
          pending?.forEach(
            (recording) => {
              if (
                !cancelled
              ) {
                queueRecording(
                  recording
                );
              }
            }
          );
        }

        initializedRef.current =
          true;
      } catch (error) {
        console.error(
          "Marvels Home Safety CCTV initialization failed:",
          error
        );

        if (!cancelled) {
          setSourceCameraId(
            null
          );

          setStream(null);
        }
      } finally {
        initializingRef.current =
          false;
      }
    };

    const handleAuthChange = (
      event: string
    ) => {
      if (
        event ===
        "SIGNED_OUT"
      ) {
        initializedRef.current =
          false;

        initializingRef.current =
          false;

        queueRef.current = [];

        queuedIdsRef.current.clear();

        homeIdRef.current =
          null;

        stopStream();

        void cleanupRealtime();

        return;
      }

      if (
        event ===
          "SIGNED_IN" ||
        event ===
          "INITIAL_SESSION"
      ) {
        void initialize();
      }
    };

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        handleAuthChange
      );

    /*
     * Also initialize immediately in case
     * the session already exists.
     */
    void initialize();

    /*
     * If the webcam becomes available later,
     * retry automatically when the browser
     * reports a device change.
     */
    const handleDeviceChange =
      () => {
        if (
          cancelled ||
          !mountedRef.current
        ) {
          return;
        }

        if (
          !streamRef.current?.active
        ) {
          initializedRef.current =
            false;

          void initialize();
        }
      };

    navigator.mediaDevices?.addEventListener(
      "devicechange",
      handleDeviceChange
    );

    /*
     * When the browser tab becomes active again,
     * recover the camera if it disappeared.
     */
    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState !==
          "visible"
        ) {
          return;
        }

        if (
          cancelled ||
          !mountedRef.current
        ) {
          return;
        }

        if (
          !streamRef.current?.active
        ) {
          initializedRef.current =
            false;

          void initialize();
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      cancelled = true;

      mountedRef.current =
        false;

      subscription.unsubscribe();

      navigator.mediaDevices?.removeEventListener(
        "devicechange",
        handleDeviceChange
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      queueRef.current = [];

      queuedIdsRef.current.clear();

      /*
       * Delay physical camera cleanup slightly.
       *
       * This prevents a development-mode
       * React/Turbopack mount-cleanup-remount
       * cycle from immediately stopping the
       * webcam and reopening it at the exact
       * same moment.
       */
      delayedCleanupRef.current =
        setTimeout(() => {
          if (
            mountedRef.current
          ) {
            return;
          }

          stopStream();

          void cleanupRealtime();

          initializedRef.current =
            false;

          initializingRef.current =
            false;

          homeIdRef.current =
            null;

          delayedCleanupRef.current =
            null;
        }, 500);
    };
  }, [
    setStream,
    setSourceCameraId,
  ]);

  /*
   * CCTVManager is a background manager.
   *
   * It intentionally renders nothing.
   * LiveCamera attaches the shared MediaStream
   * to the visible camera viewer.
   */
  return null;
}