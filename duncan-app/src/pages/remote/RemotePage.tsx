import { useState } from "react";
import { Typography } from "antd";
import { Joystick } from "react-joystick-component";

import { StatusLight } from "../../components/status-light/StatusLight";

import type {
  LeftDirection,
  RightDirection,
} from "../../types/messages";

import styles from "./RemotePage.module.css";

const { Title } = Typography;

type JoystickEvent = {
  direction?: "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT";
};

export function RemotePage() {
  // 測試用：改成 false 可測試解鎖
  const [lock, setLock] = useState(true);

  const [leftDirection, setLeftDirection] =
    useState<LeftDirection>("");

  const [rightDirection, setRightDirection] =
    useState<RightDirection>("");

  const mapLeftDirection = (
    direction?: "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT",
  ): LeftDirection => {
    if (direction === "FORWARD") return "W";
    if (direction === "BACKWARD") return "S";
    if (direction === "LEFT") return "A";
    if (direction === "RIGHT") return "D";
    return "";
  };

  const mapRightDirection = (
    direction?: "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT",
  ): RightDirection => {
    if (direction === "FORWARD") return "I";
    if (direction === "BACKWARD") return "K";
    if (direction === "LEFT") return "J";
    if (direction === "RIGHT") return "L";
    return "";
  };

  const handleLeftMove = (event: JoystickEvent) => {
    const direction = mapLeftDirection(event.direction);
    setLeftDirection(direction);

    // lock 時只更新 UI，不發送
    if (!lock) {
      console.log("SEND:", {
        type: "joystick",
        left: direction,
        right: rightDirection,
      });
    }
  };

  const handleRightMove = (event: JoystickEvent) => {
    const direction = mapRightDirection(event.direction);
    setRightDirection(direction);

    if (!lock) {
      console.log("SEND:", {
        type: "joystick",
        left: leftDirection,
        right: direction,
      });
    }
  };

  return (
    <div className={styles.page}>
      <StatusLight locked={lock} />

      <Title level={3} className={styles.title}>
        Remote Control
      </Title>

      <div className={styles.joystickLayer}>
        <div className={styles.joystickGroup}>
          <span className={styles.joystickLabel}>LEFT</span>

          <Joystick
            size={150}
            sticky={false}
            baseColor="rgba(255, 255, 255, 0.12)"
            stickColor="rgba(255, 255, 255, 0.38)"
            move={handleLeftMove}
            stop={() => setLeftDirection("")}
          />

          <span className={styles.directionValue}>
            {leftDirection || "-"}
          </span>
        </div>

        <div className={styles.joystickGroup}>
          <span className={styles.joystickLabel}>RIGHT</span>

          <Joystick
            size={150}
            sticky={false}
            baseColor="rgba(255, 255, 255, 0.12)"
            stickColor="rgba(255, 255, 255, 0.38)"
            move={handleRightMove}
            stop={() => setRightDirection("")}
          />

          <span className={styles.directionValue}>
            {rightDirection || "-"}
          </span>
        </div>
      </div>

      <button
        className={styles.testLockButton}
        onClick={() => setLock((previous) => !previous)}
      >
        {lock ? "Unlock（測試）" : "Lock（測試）"}
      </button>
    </div>
  );
}
