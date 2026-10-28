import { useCallback, useEffect, useRef, useState } from "react";

import { useSlamMap } from "../../hooks/useSlamMap";

import { SlamMapOverlay } from "../slam-map/SlamMapOverlay";

import styles from "./SlamRadarMinimap.module.css";

type SlamRadarMinimapProps = {
  className?: string;
  enabled?: boolean;
};

const RADAR_SIZE = 320;
const VIEW_DISTANCE = 120;
const VIEW_FOV = Math.PI / 3;

const UP_DIRECTION = -Math.PI / 2;

export function SlamRadarMinimap({
  className,
  enabled = true,
}: SlamRadarMinimapProps) {
  const {
    slamMap,
    robotPose,
    destination,
    pendingClick,
    handleMapClick,
  } = useSlamMap({ enabled });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  useEffect(() => {
    if (!slamMap) {
      mapImageRef.current = null;
      return;
    }

    const image = new Image();
    image.src = slamMap.image;

    image.onload = () => {
      mapImageRef.current = image;
      drawRadar();
    };
  }, [slamMap]);

  const drawRadar = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const center = RADAR_SIZE / 2;
    const radarRadius = center - 2;

    ctx.clearRect(0, 0, RADAR_SIZE, RADAR_SIZE);

    ctx.beginPath();
    ctx.arc(center, center, radarRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(4, 10, 22, 0.85)";
    ctx.fill();

    const mapImage = mapImageRef.current;

    if (mapImage && slamMap && robotPose) {
      const robotMapX =
        (robotPose.x - slamMap.origin.x) / slamMap.resolution;

      const robotMapY =
        (robotPose.y - slamMap.origin.y) / slamMap.resolution;

      ctx.save();

      ctx.beginPath();
      ctx.arc(center, center, radarRadius, 0, Math.PI * 2);
      ctx.clip();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(-robotPose.yaw);
      ctx.translate(-robotMapX, -robotMapY);
      ctx.drawImage(mapImage, 0, 0);
      ctx.restore();

      drawViewCone(ctx, center, center, UP_DIRECTION);
      drawRobotMarker(ctx, center, center, 0);

      ctx.restore();
    } else {
      drawViewCone(ctx, center, center, UP_DIRECTION);
      drawRobotMarker(ctx, center, center, 0);
    }

    const edgeGradient = ctx.createRadialGradient(
      center,
      center,
      radarRadius * 0.62,
      center,
      center,
      radarRadius,
    );

    edgeGradient.addColorStop(0, "rgba(4, 10, 22, 0)");
    edgeGradient.addColorStop(0.75, "rgba(4, 10, 22, 0.35)");
    edgeGradient.addColorStop(1, "rgba(4, 10, 22, 0.92)");

    ctx.beginPath();
    ctx.arc(center, center, radarRadius, 0, Math.PI * 2);
    ctx.fillStyle = edgeGradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center, center, radarRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 220, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [slamMap, robotPose]);

  useEffect(() => {
    drawRadar();
  }, [drawRadar]);

  return (
    <>
      <div
        className={[styles.radar, className].filter(Boolean).join(" ")}
        onClick={() => setIsOverlayOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Open SLAM map"
      >
        <canvas
          ref={canvasRef}
          width={RADAR_SIZE}
          height={RADAR_SIZE}
          className={styles.radarCanvas}
        />

        {!slamMap && (
          <span className={styles.radarPlaceholder}>
            SLAM
            <br />
            WAITING
          </span>
        )}
      </div>

      {isOverlayOpen && (
        <SlamMapOverlay
          slamMap={slamMap}
          robotPose={robotPose}
          destination={destination}
          pendingClick={pendingClick}
          onMapClick={handleMapClick}
          onClose={() => setIsOverlayOpen(false)}
        />
      )}
    </>
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

  const gradient = ctx.createRadialGradient(
    x,
    y,
    0,
    x,
    y,
    VIEW_DISTANCE,
  );

  gradient.addColorStop(0, "rgba(0, 229, 255, 0.30)");
  gradient.addColorStop(0.65, "rgba(0, 229, 255, 0.12)");
  gradient.addColorStop(1, "rgba(0, 229, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.restore();
}

function drawRobotMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  yaw: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(yaw);

  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fillStyle = "#00e5ff";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(8, 6);
  ctx.lineTo(-8, 6);
  ctx.closePath();
  ctx.fillStyle = "#00e5ff";
  ctx.fill();

  ctx.restore();
}
