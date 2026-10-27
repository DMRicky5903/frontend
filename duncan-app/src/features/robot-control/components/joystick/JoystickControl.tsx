import { useCallback, useRef } from "react";
import {
  CaretDownOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
  CaretUpOutlined,
} from "@ant-design/icons";

import styles from "./JoystickControl.module.css";

type Direction = "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT";

type JoystickControlProps = {
  label: string;
  side: "left" | "right";
  value: Direction | "";
  onMove: (direction: Direction) => void;
  onStop: () => void;
  size?: number;
};

const LEFT_DIRECTION_MAP: Record<Direction, string> = {
  FORWARD: "W",
  BACKWARD: "S",
  LEFT: "A",
  RIGHT: "D",
};

const RIGHT_DIRECTION_MAP: Record<Direction, string> = {
  FORWARD: "I",
  BACKWARD: "K",
  LEFT: "J",
  RIGHT: "L",
};

export function JoystickControl({
  label,
  side,
  value,
  onMove,
  onStop,
  size = 170,
}: JoystickControlProps) {
  const baseRef = useRef<HTMLDivElement>(null);

  const directionMap =
    side === "right" ? RIGHT_DIRECTION_MAP : LEFT_DIRECTION_MAP;

  const stickOffset = size * 0.22;

  const stickTransform =
    value === "FORWARD"
      ? `translate(-50%, -50%) translateY(-${stickOffset}px)`
      : value === "BACKWARD"
        ? `translate(-50%, -50%) translateY(${stickOffset}px)`
        : value === "LEFT"
          ? `translate(-50%, -50%) translateX(-${stickOffset}px)`
          : value === "RIGHT"
            ? `translate(-50%, -50%) translateX(${stickOffset}px)`
            : "translate(-50%, -50%)";

  const getDirectionFromPosition = useCallback(
    (clientX: number, clientY: number): Direction => {
      const base = baseRef.current;

      if (!base) {
        return "FORWARD";
      }

      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? "RIGHT" : "LEFT";
      }

      return deltaY > 0 ? "BACKWARD" : "FORWARD";
    },
    [],
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 1) {
      return;
    }

    onMove(getDirectionFromPosition(event.clientX, event.clientY));
  };

  const handlePointerUp = () => {
    onStop();
  };

  return (
    <div className={styles.joystickGroup}>
      <div className={styles.joystickHeader}>
        <span className={styles.joystickLabel}>{label}</span>

        <span className={styles.joystickKey}>
          {value ? directionMap[value] : "--"}
        </span>
      </div>

      <div
        ref={baseRef}
        className={`${styles.joystickBase} ${
          value ? styles.joystickBaseActive : ""
        }`}
        style={{
          width: size,
          height: size,
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);

          onMove(
            getDirectionFromPosition(event.clientX, event.clientY),
          );
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className={styles.outerRing} />
        <div className={styles.innerRing} />
        <div className={styles.crossLineHorizontal} />
        <div className={styles.crossLineVertical} />

        <CaretUpOutlined
          className={`${styles.directionIcon} ${styles.directionTop} ${
            value === "FORWARD" ? styles.directionIconActive : ""
          }`}
        />

        <CaretDownOutlined
          className={`${styles.directionIcon} ${styles.directionBottom} ${
            value === "BACKWARD" ? styles.directionIconActive : ""
          }`}
        />

        <CaretLeftOutlined
          className={`${styles.directionIcon} ${styles.directionLeft} ${
            value === "LEFT" ? styles.directionIconActive : ""
          }`}
        />

        <CaretRightOutlined
          className={`${styles.directionIcon} ${styles.directionRight} ${
            value === "RIGHT" ? styles.directionIconActive : ""
          }`}
        />

        <div
          className={`${styles.joystickStick} ${
            value ? styles.joystickStickActive : ""
          }`}
          style={{
            width: size * 0.4,
            height: size * 0.4,
            transform: stickTransform,
          }}
        >
          <div className={styles.stickCore} />
        </div>
      </div>
    </div>
  );
}
