import {
  CameraOutlined,
  DisconnectOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { useCameraStream } from "../../hooks/useCameraStream";

import styles from "./CameraFeed.module.css";

type CameraFeedProps = {
  title?: string;
  className?: string;
  connectionTimeoutMs?: number;
};

export function CameraFeed({
  title = "FRONT CAMERA",
  className,
  connectionTimeoutMs,
}: CameraFeedProps) {
  const { frameUrl, status, retry } = useCameraStream({
    connectionTimeoutMs,
  });

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
        {frameUrl ? (
          <img
            src={frameUrl}
            alt="Real-time camera stream"
            className={styles.cameraStream}
          />
        ) : (
          <div className={styles.offlineArt}>
            <div className={styles.offlineGrid} />
            <div className={styles.offlineScanline} />

            <div className={styles.offlineContent}>
              <div className={styles.offlineIcon}>
                {status === "offline" ? (
                  <DisconnectOutlined />
                ) : (
                  <CameraOutlined />
                )}
              </div>

              <h3 className={styles.offlineTitle}>
                {status === "offline" ? "SIGNAL LOST" : "WAITING FOR STREAM"}
              </h3>

              <p className={styles.offlineDescription}>
                {status === "offline"
                  ? "No camera frames received. Check the backend stream."
                  : "Waiting for OpenCV camera frames..."}
              </p>

              {status === "offline" && (
                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={retry}
                >
                  <ReloadOutlined />
                  Retry
                </button>
              )}

              {status === "connecting" && !frameUrl && (
                <div className={styles.connectingHint}>
                  <LoadingOutlined className={styles.loadingIcon} />
                  <span>Connecting to camera...</span>
                </div>
              )}
            </div>

          </div>
        )}

        <div className={styles.viewportCornerTopLeft} />
        <div className={styles.viewportCornerTopRight} />
        <div className={styles.viewportCornerBottomLeft} />
        <div className={styles.viewportCornerBottomRight} />
      </div>

      <footer className={styles.cameraFooter}>
        <span>OPENCV FEED</span>
        <span>WEBSOCKET LIVE STREAM</span>
      </footer>
    </section>
  );
}
