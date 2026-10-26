import { useCallback, useState } from "react";
import { Typography } from "antd";

import { CameraFeed } from "../../components/camera/CameraFeed";
import { JoystickControl } from "../../components/joystick/JoystickControl";
import { StatusLight } from "../../components/status-light/StatusLight";

import { useKeyboardJoystick } from "../../hooks/useKeyboardJoystick";

import type {
  LeftDirection,
  RightDirection,
} from "../../types/messages";

import styles from "./RemotePage.module.css";

const { Title } = Typography;

type Direction = "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT";

const CAMERA_STREAM_URL =
  import.meta.env.VITE_CAMERA_STREAM_URL ?? "";

export function RemotePage() {
  const [lock, setLock] = useState(true);

  const [leftDirection, setLeftDirection] =
    useState<LeftDirection>("");

  const [rightDirection, setRightDirection] =
    useState<RightDirection>("");

  const handleLeftMove = useCallback(
    (direction: Direction | "") => {
      setLeftDirection(direction as LeftDirection);

      if (!lock && direction) {
        console.log("SEND:", {
          type: "joystick",
          left: direction,
          right: rightDirection,
        });
      }
    },
    [lock, rightDirection],
  );

  const handleRightMove = useCallback(
    (direction: Direction | "") => {
      setRightDirection(direction as RightDirection);

      if (!lock && direction) {
        console.log("SEND:", {
          type: "joystick",
          left: leftDirection,
          right: direction,
        });
      }
    },
    [lock, leftDirection],
  );

  useKeyboardJoystick({
    onLeftChange: handleLeftMove,
    onRightChange: handleRightMove,
  });

  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGrid} />

      <header className={styles.pageHeader}>
        <div className={styles.headerSide}>
          <StatusLight locked={lock} />
        </div>

        <div className={styles.titleGroup}>
          <span className={styles.titleTag}>
            ROBOT CONTROL SYSTEM
          </span>

          <Title level={2} className={styles.title}>
            REMOTE CONTROL
          </Title>

          <div className={styles.titleDivider}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.joystickColumn}>
          <JoystickControl
            label="LEFT"
            side="left"
            value={leftDirection as Direction | ""}
            onMove={handleLeftMove}
            onStop={() => handleLeftMove("")}
          />
        </div>

        <section className={styles.cameraColumn}>
          <CameraFeed
            title="FRONT CAMERA"
            streamUrl={CAMERA_STREAM_URL || undefined}
            className={styles.cameraFeed}
          />
        </section>

        <div className={styles.joystickColumn}>
          <JoystickControl
            label="RIGHT"
            side="right"
            value={rightDirection as Direction | ""}
            onMove={handleRightMove}
            onStop={() => handleRightMove("")}
          />
        </div>
      </main>
    </div>
  );
}
