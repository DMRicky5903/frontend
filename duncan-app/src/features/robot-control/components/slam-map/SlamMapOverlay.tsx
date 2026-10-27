import { useCallback, useEffect, useRef } from "react";

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
  const mapImageRef = useRef<HTMLImageElement | null>(null);

  // 載入地圖
  useEffect(() => {
    if (!slamMap) {
      mapImageRef.current = null;
      return;
    }

    const image = new Image();
    image.src = slamMap.image;

    image.onload = () => {
      mapImageRef.current = image;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!canvas || !ctx) return;

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      drawMap();
    };
  }, [slamMap]);

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const mapImage = mapImageRef.current;

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 沒有地圖：保持空白
    if (!mapImage || !slamMap) {
      return;
    }

    ctx.drawImage(mapImage, 0, 0);

    // 畫機器人與視線方向
    if (robotPose) {
      const robotX =
        (robotPose.x - slamMap.origin.x) / slamMap.resolution;

      const robotY =
        (robotPose.y - slamMap.origin.y) / slamMap.resolution;

      // ROS yaw 是逆時針；Canvas y 軸向下，
      // 繪圖時使用 -yaw 才能對應地圖方向
      const canvasYaw = -robotPose.yaw;

      drawViewCone(
        ctx,
        robotX,
        robotY,
        canvasYaw,
      );

      drawRobot(ctx, robotX, robotY, canvasYaw);
    }

    // 畫 pending 圓點
    if (pendingClick) {
      ctx.beginPath();
      ctx.arc(pendingClick.x, pendingClick.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 229, 255, 0.32)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pendingClick.x, pendingClick.y, 12, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.9)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 畫已確認旗標
    if (destination) {
      drawDestinationFlag(ctx, destination.x, destination.y);
    }
  }, [slamMap, robotPose, pendingClick, destination]);

  useEffect(() => {
    drawMap();
  }, [drawMap]);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;

      if (!canvas || !slamMap) return;

      const rect = canvas.getBoundingClientRect();

      const x = Math.round(
        ((event.clientX - rect.left) / rect.width) * canvas.width,
      );

      const y = Math.round(
        ((event.clientY - rect.top) / rect.height) * canvas.height,
      );

      onMapClick(x, y);
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

  // 由機器人向外淡出，沒有邊框線
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

  // 機器人主體
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fillStyle = "#00e5ff";
  ctx.fill();

  // 機器人前方箭頭
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
