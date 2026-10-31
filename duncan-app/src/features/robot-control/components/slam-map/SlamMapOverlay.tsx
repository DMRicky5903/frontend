import { useCallback, useEffect, useState ,useRef } from "react";

import type {
  SlamMapMessage,
  SlamPoseMessage,
} from "../../../../api/type";

import styles from "./SlamMapOverlay.module.css";

type SlamDestination = {
  x: number;
  y: number;
};

type SlamPendingClick = {
  x: number;
  y: number;
};

type SlamMapOverlayProps = {
  slamMap: SlamMapMessage | null;
  robotPose: SlamPoseMessage | null;
  destination: SlamDestination | null;
  pendingClick: SlamPendingClick | null;
  onMapClick: (x: number, y: number) => void;
  onClose: () => void;
};

type MapPixelPoint = {
  x: number;
  y: number;
};

type WorldPoint = {
  x: number;
  y: number;
};

const VIEW_DISTANCE = 160;
const VIEW_FOV = Math.PI / 3; // 60 度視野

export function SlamMapOverlay({
  slamMap,
  robotPose,
  destination,
  pendingClick,
  onMapClick,
  onClose,
}: SlamMapOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mapImage, setMapImage] =
    useState<HTMLImageElement | null>(null);

  // 1. 當 slamMap.image 改變時載入地圖
  useEffect(() => {
    if (!slamMap?.image) {
      setMapImage(null);
      return;
    }

    let cancelled = false;

    const image = new Image();

    image.onload = () => {
      if (cancelled) return;
      setMapImage(image);
    };

    image.onerror = () => {
      if (cancelled) return;
      setMapImage(null);
    };

    image.src = slamMap.image;

    return () => {
      cancelled = true;
    };
  }, [slamMap?.image]);

  // 2. 當地圖、機器人、點擊或目的地改變時重繪
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!mapImage || !slamMap) {
      return;
    }

    if (
      canvas.width !== mapImage.naturalWidth ||
      canvas.height !== mapImage.naturalHeight
    ) {
      canvas.width = mapImage.naturalWidth;
      canvas.height = mapImage.naturalHeight;
    }

    ctx.drawImage(mapImage, 0, 0);

    if (robotPose) {
      const robotPixel = worldToMapPixel(
        robotPose,
        slamMap,
      );

      const canvasYaw = -robotPose.yaw;

      drawViewCone(
        ctx,
        robotPixel.x,
        robotPixel.y,
        canvasYaw - Math.PI / 2,
      );

      drawRobot(
        ctx,
        robotPixel.x,
        robotPixel.y,
        canvasYaw,
      );
    }


    if (pendingClick) {
      const pendingPixel = worldToMapPixel(
        pendingClick,
        slamMap,
      );

      ctx.beginPath();
      ctx.arc(
        pendingPixel.x,
        pendingPixel.y,
        12,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "rgba(0, 229, 255, 0.32)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(
        pendingPixel.x,
        pendingPixel.y,
        12,
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = "rgba(0, 229, 255, 0.9)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    if (destination) {
      const destinationPixel = worldToMapPixel(
        destination,
        slamMap,
      );

      drawDestinationFlag(
        ctx,
        destinationPixel.x,
        destinationPixel.y,
      );
    }
  }, [
    mapImage,
    slamMap,
    robotPose,
    pendingClick,
    destination,
  ]);

  useEffect(() => {
    drawMap();
  }, [drawMap]);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;

      if (!canvas || !slamMap) return;

      const rect = canvas.getBoundingClientRect();

      const pixelX =
        ((event.clientX - rect.left) / rect.width) *
        canvas.width;

      const pixelY =
        ((event.clientY - rect.top) / rect.height) *
        canvas.height;

      const worldX =
        slamMap.origin.x +
        pixelX * slamMap.resolution;

      const worldY =
        slamMap.origin.y +
        pixelY * slamMap.resolution;

      onMapClick(worldX, worldY);
    },
    [slamMap, onMapClick],
  );

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <span className={styles.title}>SLAM MAP</span>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close SLAM map"
          >
            ✕
          </button>
        </header>

        <div className={styles.mapContainer}>
          <canvas
            ref={canvasRef}
            className={styles.mapCanvas}
            onClick={handleCanvasClick}
          />

          {!slamMap && (
            <div className={styles.emptyMap}>
              SLAM map not available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function worldToMapPixel(
  point: WorldPoint,
  slamMap: SlamMapMessage,
): MapPixelPoint {
  return {
    x:
      (point.x - slamMap.origin.x) /
      slamMap.resolution,

    y:
      (point.y - slamMap.origin.y) /
      slamMap.resolution,
  };
}

function drawViewCone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  yaw: number,
) {
  const startAngle = yaw - VIEW_FOV / 2;
  const endAngle = yaw + VIEW_FOV / 2;

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, VIEW_DISTANCE, startAngle, endAngle);
  ctx.closePath();

  const gradient = ctx.createRadialGradient(
    x,
    y,
    0,
    x,
    y,
    VIEW_DISTANCE,
  );

  gradient.addColorStop(0, "rgba(0, 229, 255, 0.26)");
  gradient.addColorStop(0.65, "rgba(0, 229, 255, 0.1)");
  gradient.addColorStop(1, "rgba(0, 229, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.restore();
}

function drawRobot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  yaw: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(yaw);

  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fillStyle = "#00e5ff";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(10, 8);
  ctx.lineTo(-10, 8);
  ctx.closePath();
  ctx.fillStyle = "#00e5ff";
  ctx.fill();

  ctx.restore();
}

function drawDestinationFlag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 30);
  ctx.strokeStyle = "#ff5470";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y - 30);
  ctx.lineTo(x + 22, y - 21);
  ctx.lineTo(x, y - 12);
  ctx.closePath();
  ctx.fillStyle = "#ff5470";
  ctx.fill();
}
