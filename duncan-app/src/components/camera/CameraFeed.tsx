import { useEffect, useState } from "react";
import {
  CameraOutlined,
  DisconnectOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import styles from "./CameraFeed.module.css";

type CameraFeedProps = {
  streamUrl?: string;
  title?: string;
  className?: string;
};

export function CameraFeed({
  streamUrl,
  title = "FRONT CAMERA",
  className,
}: CameraFeedProps) {
  const [status, setStatus] = useState<"connecting" | "online" | "offline">(
    streamUrl ? "connecting" : "offline",
  );

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!streamUrl) {
      setStatus("offline");
      return;
    }

    setStatus("connecting");

    const timeout = window.setTimeout(() => {
      setStatus((currentStatus) =>
        currentStatus === "connecting" ? "offline" : currentStatus,
      );
    }, 6000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [streamUrl, reloadKey]);

  const handleLoad = () => {
    setStatus("online");
  };

  const handleError = () => {
    setStatus("offline");
  };

  const handleRetry = () => {
    if (!streamUrl) {
      return;
    }

    setReloadKey((key) => key + 1);
    setStatus("connecting");
  };

  return (
    <section className={`${styles.cameraPanel} ${className ?? ""}`}>
      <header className={styles.cameraHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.cameraIcon}>
            <CameraOutlined />
          </span>

          <span className={styles.cameraTitle}>{title}</span>
        </div>

        <div
          className={`${styles.statusPill} ${
            status === "online"
              ? styles.statusOnline
              : status === "connecting"
                ? styles.statusConnecting
                : styles.statusOffline
          }`}
        >
          <span className={styles.statusDot} />

          {status === "online"
            ? "LIVE"
            : status === "connecting"
              ? "CONNECTING"
              : "OFFLINE"}
        </div>
      </header>

      <div className={styles.cameraViewport}>
        {streamUrl && status !== "offline" ? (
          <img
            key={reloadKey}
            src={streamUrl}
            alt="Camera stream"
            className={styles.cameraStream}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          <div className={styles.offlineArt}>
            <div className={styles.offlineGrid} />
            <div className={styles.offlineScanline} />

            <div className={styles.offlineContent}>
              <div className={styles.offlineIcon}>
                {streamUrl ? (
                  <DisconnectOutlined />
                ) : (
                  <CameraOutlined />
                )}
              </div>

              <h3 className={styles.offlineTitle}>
                {streamUrl ? "SIGNAL LOST" : "CAMERA OFFLINE"}
              </h3>

              <p className={styles.offlineDescription}>
                {streamUrl
                  ? "Waiting for OpenCV video stream..."
                  : "Backend camera stream is not connected."}
              </p>

              {streamUrl && (
                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={handleRetry}
                >
                  <ReloadOutlined />
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        {status === "connecting" && (
          <div className={styles.loadingOverlay}>
            <LoadingOutlined className={styles.loadingIcon} />
            <span>Connecting to camera...</span>
          </div>
        )}

        <div className={styles.viewportCornerTopLeft} />
        <div className={styles.viewportCornerTopRight} />
        <div className={styles.viewportCornerBottomLeft} />
        <div className={styles.viewportCornerBottomRight} />
      </div>

      <footer className={styles.cameraFooter}>
        <span>OPENCV FEED</span>
        <span>{streamUrl ? streamUrl : "NOT CONFIGURED"}</span>
      </footer>
    </section>
  );
}
