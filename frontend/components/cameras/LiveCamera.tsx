"use client";

import { useEffect, useRef, useState } from "react";
import { useCCTV } from "@/components/cameras/CCTVContext";

type LiveCameraProps = {
  cameraId: string;
  cameraName?: string;
  cameraLocation?: string | null;
};

export default function LiveCamera({
  cameraId,
  cameraName = "Development Laptop Webcam",
  cameraLocation,
}: LiveCameraProps) {
  const {
    stream,
    sourceCameraId,
    isAvailable,
  } = useCCTV();

  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoReady, setVideoReady] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isThisCameraSource =
    cameraId === sourceCameraId;

  function attachSharedCamera() {
    setError("");
    setMessage("");

    const video = videoRef.current;

    if (!video) {
      setError("The camera viewer is still loading.");
      return;
    }

    if (!isThisCameraSource) {
      setError(
        "This camera does not have a connected live video source."
      );
      setIsActive(false);
      return;
    }

    if (!stream || !stream.active || !isAvailable) {
      setError(
        "The CCTV camera is not currently available."
      );
      setIsActive(false);
      return;
    }

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    void video.play().catch((playError) => {
      console.warn(
        "Shared CCTV playback warning:",
        playError
      );
    });

    setIsActive(true);
    setMessage("CCTV camera is live.");
  }

  function stopCamera() {
    const video = videoRef.current;

    if (video) {
      video.pause();
      video.srcObject = null;
    }

    setIsActive(false);
    setMessage("");
    setError("");
  }

  useEffect(() => {
    setVideoReady(true);

    return () => {
      const video = videoRef.current;

      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isAvailable || !isThisCameraSource || !stream) {
      setIsActive(false);

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }

      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    void video.play()
      .then(() => {
        setError("");
        setMessage("CCTV camera is live.");
        setIsActive(true);
      })
      .catch((playError) => {
        console.warn(
          "Automatic CCTV playback warning:",
          playError
        );
        setError("The CCTV camera is available, but live playback could not start.");
        setIsActive(false);
      });
  }, [
    stream,
    isAvailable,
    isThisCameraSource,
  ]);

  const canViewCamera =
    isAvailable && isThisCameraSource;

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
                isActive
                  ? "bg-emerald-400"
                  : "bg-slate-600"
              }`}
            />

            <span className="text-slate-400">
              {isActive ? "LIVE" : "OFFLINE"}
            </span>
          </div>
        </div>

        <span className="text-xl">📹</span>
      </div>

      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
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
                  ? canViewCamera
                    ? "Camera is ready"
                    : "Live stream unavailable for this camera"
                  : "Preparing camera viewer..."}
              </p>
            </div>
          </div>
        )}

        {isActive && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            LIVE
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
            onClick={attachSharedCamera}
            disabled={!videoReady || !canViewCamera}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!videoReady
              ? "Preparing Camera..."
              : canViewCamera
                ? "Start Live View"
                : "Camera Unavailable"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopCamera}
            className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Stop Live View
          </button>
        )}
      </div>
    </div>
  );
}