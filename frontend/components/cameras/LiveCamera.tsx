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

  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
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

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setMessage("Requesting webcam access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;

      const currentVideo = videoRef.current;

      if (!currentVideo) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        throw new Error(
          "The camera viewer disappeared. Please try again."
        );
      }

      currentVideo.srcObject = stream;
      currentVideo.muted = true;
      currentVideo.playsInline = true;

      /*
       * Some browsers expose the stream before metadata is ready.
       * We don't fail the camera startup simply because metadata
       * takes a little longer to arrive.
       */
      if (currentVideo.readyState < HTMLMediaElement.HAVE_METADATA) {
        await new Promise<void>((resolve) => {
          const handleMetadata = () => {
            cleanup();
            resolve();
          };

          const timeout = window.setTimeout(() => {
            cleanup();
            resolve();
          }, 3000);

          const cleanup = () => {
            window.clearTimeout(timeout);
            currentVideo.removeEventListener(
              "loadedmetadata",
              handleMetadata
            );
          };

          currentVideo.addEventListener(
            "loadedmetadata",
            handleMetadata,
            { once: true }
          );
        });
      }

      try {
        await currentVideo.play();
      } catch (playError) {
        console.warn("Video play warning:", playError);
      }

      const liveTrack = stream.getVideoTracks().find(
        (track) => track.readyState === "live"
      );

      if (!liveTrack) {
        throw new Error(
          "The webcam stream started but no live video track is available."
        );
      }

      setIsActive(true);
      setMessage("Webcam is live.");
    } catch (err) {
      console.error("Camera access error:", err);

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

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