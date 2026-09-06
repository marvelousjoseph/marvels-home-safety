"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type CCTVContextValue = {
  stream: MediaStream | null;
  sourceCameraId: string | null;
  isAvailable: boolean;
  setStream: (stream: MediaStream | null) => void;
  setSourceCameraId: (cameraId: string | null) => void;
};

const CCTVContext = createContext<CCTVContextValue | undefined>(
  undefined
);

export function CCTVProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sourceCameraId, setSourceCameraId] =
    useState<string | null>(null);

  return (
    <CCTVContext.Provider
      value={{
        stream,
        sourceCameraId,
        isAvailable: !!stream?.active,
        setStream,
        setSourceCameraId,
      }}
    >
      {children}
    </CCTVContext.Provider>
  );
}

export function useCCTV() {
  const context = useContext(CCTVContext);

  if (!context) {
    throw new Error(
      "useCCTV must be used inside CCTVProvider."
    );
  }

  return context;
}