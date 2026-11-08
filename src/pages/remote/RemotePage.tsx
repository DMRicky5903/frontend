import { useCallback } from "react";
import { Typography } from "antd";

import { CameraFeed } from "../../features/robot-control/components/camera/CameraFeed";
import { JoystickControl } from "../../features/robot-control/components/joystick/JoystickControl";
import { StatusLight } from "../../features/robot-control/components/status-light/StatusLight";
import { SlamRadarMinimap } from "../../features/robot-control/components/slam-radar/SlamRadarMinimap";

import { useKeyboardJoystick } from "../../features/robot-control/hooks/useKeyboardJoystick";
import { useRobotControl } from "../../features/robot-control/hooks/useRobotControl";
import { useControlPermission } from "../../api/useControlPermission";

import type {
  WheelDirection,
  GimbalDirection,
} from "../../api/type";

import styles from "./RemotePage.module.css";

const { Title } = Typography;

type Direction = "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT";

const DIRECTION_TO_WHEEL: Record<Direction, WheelDirection> = {
  FORWARD: "W",
  BACKWARD: "S",
  LEFT: "A",
  RIGHT: "D",
};

const DIRECTION_TO_GIMBAL: Record<Direction, GimbalDirection> = {
  FORWARD: "I",
  BACKWARD: "K",
  LEFT: "J",
  RIGHT: "L",
};

const WHEEL_TO_DIRECTION: Record<WheelDirection, Direction | ""> = {
  W: "FORWARD",
  S: "BACKWARD",
  A: "LEFT",
  D: "RIGHT",
  "": "",
};

const GIMBAL_TO_DIRECTION: Record<GimbalDirection, Direction | ""> = {
  I: "FORWARD",
  K: "BACKWARD",
  J: "LEFT",
  L: "RIGHT",
  "": "",
};

export function RemotePage() {
  const { canSend } = useControlPermission(2);

  const {
    wheelDirection,
    gimbalDirection,
    moveWheel,
    moveGimbal,
  } = useRobotControl({ enabled: canSend });

  const handleLeftMove = useCallback(
    (direction: Direction | "") => {
      moveWheel(
        direction ? DIRECTION_TO_WHEEL[direction] : "",
      );
    },
    [moveWheel],
  );

  const handleRightMove = useCallback(
    (direction: Direction | "") => {
      moveGimbal(
        direction ? DIRECTION_TO_GIMBAL[direction] : "",
      );
    },
    [moveGimbal],
  );

  useKeyboardJoystick({
    onLeftChange: handleLeftMove,
    onRightChange: handleRightMove,
  });

  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGrid} />

      <SlamRadarMinimap enabled={canSend} />

      <header className={styles.pageHeader}>
        <div className={styles.headerSide}>
          <StatusLight locked={!canSend} />
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
              value={WHEEL_TO_DIRECTION[wheelDirection]}
              onMove={handleLeftMove}
              onStop={() => handleLeftMove("")}
            />
          </div>
        </div>

        <section className={styles.cameraColumn}>
          <CameraFeed
            title="FRONT CAMERA"
            className={styles.cameraFeed}
          />
        </section>

        <div className={styles.joystickColumn}>
          <div className={styles.joystickScale}>
            <JoystickControl
              label="RIGHT"
              side="right"
              value={GIMBAL_TO_DIRECTION[gimbalDirection]}
              onMove={handleRightMove}
              onStop={() => handleRightMove("")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
