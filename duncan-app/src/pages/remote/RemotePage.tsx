//src/pages/remote/RemotePage.tsx

import { useCallback, useState } from "react";
import { Typography } from "antd";

import { CameraFeed } from "../../components/camera/CameraFeed";
import { JoystickControl } from "../../components/joystick/JoystickControl";
import { StatusLight } from "../../components/status-light/StatusLight";

import { useKeyboardJoystick } from "../../hooks/useKeyboardJoystick";

import type {
  WheelDirection,
  GimbalDirection,
} from "../../types/messages";

import styles from "./RemotePage.module.css";

const { Title } = Typography;

type Direction = "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT";

const CAMERA_STREAM_URL =
  import.meta.env.VITE_CAMERA_STREAM_URL ?? "";

export function RemotePage() {
  const [lock, setLock] = useState(true);

  const [WheelDirection, setWheelDirection] =
    useState<WheelDirection>("");

  const [GimbalDirection, setGimbalDirection] =
    useState<GimbalDirection>("");

  const handleLeftMove = useCallback(
    (direction: Direction | "") => {
      setWheelDirection(direction as WheelDirection);

      if (!lock && direction) {
        console.log("SEND:", {
          type: "joystick",
          left: direction,
          right: GimbalDirection,
        });
      }
    },
    [lock, GimbalDirection],
  );

  const handleRightMove = useCallback(
    (direction: Direction | "") => {
      setGimbalDirection(direction as GimbalDirection);

      if (!lock && direction) {
        console.log("SEND:", {
          type: "joystick",
          left: WheelDirection,
          right: direction,
        });
      }
    },
    [lock, WheelDirection],
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
          <div className={styles.joystickScale}>
            <JoystickControl
              label="LEFT"
              side="left"
              value={WheelDirection as Direction | ""}
              onMove={handleLeftMove}
              onStop={() => handleLeftMove("")}
            />
          </div>
        </div>

        <section className={styles.cameraColumn}>
          <CameraFeed
            title="FRONT CAMERA"
            streamUrl={CAMERA_STREAM_URL || undefined}
            className={styles.cameraFeed}
          />
        </section>

        <div className={styles.joystickColumn}>
          <div className={styles.joystickScale}>
            <JoystickControl
              label="RIGHT"
              side="right"
              value={GimbalDirection as Direction | ""}
              onMove={handleRightMove}
              onStop={() => handleRightMove("")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
