"use client";

import { useEffect, useRef, useState } from "react";

type LiveCameraProps = {
  cameraId: string;
  cameraName?: string;
  cameraLocation?: string | null;
};

function getSupportedMimeType() {
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];

  return (
    types.find((type) => MediaRecorder.isTypeSupported(type)) ||
    ""
  );
}

export default function LiveCamera({
  cameraId,
  cameraName = "Development Laptop Webcam",
  cameraLocation,
}: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoReadyRef = useRef(false);

  const [videoReady, setVideoReady] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /*
   * The video element is mounted immediately.
   * This callback tells us when React has actually
   * attached the DOM video element.
   */
  function handleVideoRef(node: HTMLVideoElement | null) {
    videoRef.current = node;

    if (node) {
      videoReadyRef.current = true;
      setVideoReady(true);
    } else {
      videoReadyRef.current = false;
      setVideoReady(false);
    }
  }

  async function startCamera() {
    setError("");
    setMessage("");

    /*
     * The video element must exist before we request
     * and attach the camera stream.
     */
    const video = videoRef.current;

    if (!video || !videoReadyRef.current) {
      setError(
        "The camera viewer is still loading. Please wait a moment and try again."
      );
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access is not supported by this browser."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;

      /*
       * Re-read the ref after the permission dialog.
       * React may have re-rendered while the browser
       * was waiting for permission.
       */
      const currentVideo = videoRef.current;

      if (!currentVideo) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error(
          "The camera viewer disappeared. Please try again."
        );
      }

      currentVideo.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          reject(
            new Error("Timeout starting video source.")
          );
        }, 10000);

        const ready = () => {
          window.clearTimeout(timeout);
          resolve();
        };

        if (currentVideo.readyState >= 1) {
          ready();
        } else {
          currentVideo.onloadedmetadata = ready;
        }
      });

      await currentVideo.play();

      setIsActive(true);
      setMessage("Webcam is live.");
    } catch (err) {
      console.error("Camera access error:", err);

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;

      setIsActive(false);

      setError(
        err instanceof Error
          ? err.message
          : "Could not access the camera."
      );
    }
  }

  function stopCamera() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }

    recorderRef.current = null;

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    const video = videoRef.current;

    if (video) {
      video.pause();
      video.srcObject = null;
    }

    setIsActive(false);
    setIsRecording(false);
    setMessage("");
  }

  async function recordSecurityEvent() {
    setError("");
    setMessage("");

    const stream = streamRef.current;

    if (!stream || !isActive) {
      setError(
        "Start the webcam before recording a security event."
      );
      return;
    }

    if (recorderRef.current?.state === "recording") {
      return;
    }

    const mimeType = getSupportedMimeType();

    if (!mimeType) {
      setError(
        "This browser does not support a compatible recording format."
      );
      return;
    }

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 1_500_000,
    });

    chunksRef.current = [];
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onerror = () => {
      setIsRecording(false);
      setError("The browser could not record the webcam.");
    };

    recorder.onstop = async () => {
      setIsRecording(false);

      const blob = new Blob(chunksRef.current, {
        type: mimeType,
      });

      chunksRef.current = [];

      if (blob.size === 0) {
        setError("The browser produced an empty recording.");
        return;
      }

      try {
        setMessage("Uploading security recording...");

        const extension = mimeType.includes("mp4")
          ? "mp4"
          : "webm";

        const formData = new FormData();

        formData.append(
          "video",
          blob,
          `webcam-${Date.now()}.${extension}`
        );

        formData.append("deviceId", cameraId);

        const response = await fetch(
          "/api/cctv/record",
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Could not save security recording."
          );
        }

        setMessage(
          `Recording saved successfully for ${result.camera.name}.`
        );
      } catch (err) {
        console.error("Recording upload error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Could not upload the recording."
        );
      }
    };

    setIsRecording(true);
    setMessage(
      "Recording security event for 10 seconds..."
    );

    recorder.start();

    window.setTimeout(() => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
    }, 10000);
  }

  useEffect(() => {
    return () => {
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-white">
            {cameraName}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {cameraLocation || "Location not specified"}
          </p>

          <div className="mt-2 flex items-center gap-2 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                isRecording
                  ? "bg-red-500"
                  : isActive
                    ? "bg-emerald-400"
                    : "bg-slate-600"
              }`}
            />

            <span className="text-slate-400">
              {isRecording
                ? "RECORDING"
                : isActive
                  ? "LIVE"
                  : "OFFLINE"}
            </span>
          </div>
        </div>

        <span className="text-xl">📹</span>
      </div>

      <div className="relative aspect-video bg-black">
        <video
          ref={handleVideoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />

        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="text-4xl">📹</div>

              <p className="mt-3 text-sm text-slate-400">
                {videoReady
                  ? "Camera is not active"
                  : "Preparing camera viewer..."}
              </p>
            </div>
          </div>
        )}

        {isActive && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
            <span
              className={`h-2 w-2 rounded-full ${
                isRecording
                  ? "bg-red-500"
                  : "bg-emerald-400"
              }`}
            />

            {isRecording ? "RECORDING" : "LIVE"}
          </div>
        )}
      </div>

      {error && (
        <div className="border-t border-red-900 bg-red-950/30 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="border-t border-slate-800 bg-slate-950 px-5 py-4 text-sm text-slate-300">
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-3 p-5">
        {!isActive ? (
          <button
            type="button"
            onClick={startCamera}
            disabled={!videoReady}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {videoReady
              ? "Start Live View"
              : "Preparing Camera..."}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={recordSecurityEvent}
              disabled={isRecording}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRecording
                ? "Recording..."
                : "Record Security Event"}
            </button>

            <button
              type="button"
              onClick={stopCamera}
              disabled={isRecording}
              className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Stop Live View
            </button>
          </>
        )}
      </div>
    </div>
  );
}
