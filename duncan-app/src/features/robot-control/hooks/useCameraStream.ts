import { useCallback, useEffect, useRef, useState } from "react";

import { useWebSocketCameraFrame } from "../../../api/useWebSocket";

type CameraStreamStatus = "connecting" | "online" | "offline";

type UseCameraStreamOptions = {
  connectionTimeoutMs?: number;
  frameTimeoutMs?: number;
};

export function useCameraStream({
  connectionTimeoutMs = 3000,
  frameTimeoutMs = 3000,
}: UseCameraStreamOptions = {}) {
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<CameraStreamStatus>("connecting");

  const currentUrlRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearStreamTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startStreamTimeout = useCallback(
    (nextStatus: CameraStreamStatus) => {
      clearStreamTimeout();

      timeoutRef.current = window.setTimeout(
        () => {
          setFrameUrl(null);
          setStatus("offline");

          if (currentUrlRef.current) {
            URL.revokeObjectURL(currentUrlRef.current);
            currentUrlRef.current = null;
          }

          timeoutRef.current = null;
        },
        nextStatus === "connecting"
          ? connectionTimeoutMs
          : frameTimeoutMs,
      );
    },
    [clearStreamTimeout, connectionTimeoutMs, frameTimeoutMs],
  );

  const handleCameraFrame = useCallback(
    (frame: Blob | ArrayBuffer) => {
      const blob =
        frame instanceof Blob
          ? frame
          : new Blob([frame], { type: "image/jpeg" });

      const nextUrl = URL.createObjectURL(blob);

      clearStreamTimeout();
      setFrameUrl(nextUrl);
      setStatus("online");

      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
      }

      currentUrlRef.current = nextUrl;

      startStreamTimeout("online");
    },
    [clearStreamTimeout, startStreamTimeout],
  );

  useWebSocketCameraFrame(handleCameraFrame);

  useEffect(() => {
    startStreamTimeout("connecting");

    return () => {
      clearStreamTimeout();
    };
  }, [startStreamTimeout]);

  const retry = useCallback(() => {
    clearStreamTimeout();

    if (currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current);
      currentUrlRef.current = null;
    }

    setFrameUrl(null);
    setStatus("connecting");

    startStreamTimeout("connecting");
  }, [clearStreamTimeout, startStreamTimeout]);

  useEffect(() => {
    return () => {
      clearStreamTimeout();

      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
    };
  }, [clearStreamTimeout]);

  return {
    frameUrl,
    status,
    retry,
  };
}
