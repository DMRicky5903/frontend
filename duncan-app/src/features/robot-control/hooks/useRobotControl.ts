import { useCallback, useState } from "react";

import { useWebSocketSend } from "../../../api/useWebSocket";

import type {
  GimbalDirection,
  WheelDirection,
} from "../../../api/type";

type UseRobotControlOptions = {
  enabled?: boolean;
};

export function useRobotControl({
  enabled = true,
}: UseRobotControlOptions = {}) {
  const [wheelDirection, setWheelDirection] =
    useState<WheelDirection>("");

  const [gimbalDirection, setGimbalDirection] =
    useState<GimbalDirection>("");

  const send = useWebSocketSend();

  const moveWheel = useCallback(
    (direction: WheelDirection) => {
      setWheelDirection(direction);

      if (!enabled) {
        return;
      }

      send({
        type: "joystick",
        wheels: direction,
        gimbal: gimbalDirection,
      });
    },
    [enabled, gimbalDirection, send],
  );

  const moveGimbal = useCallback(
    (direction: GimbalDirection) => {
      setGimbalDirection(direction);

      if (!enabled) {
        return;
      }

      send({
        type: "joystick",
        wheels: wheelDirection,
        gimbal: direction,
      });
    },
    [enabled, wheelDirection, send],
  );

  return {
    wheelDirection,
    gimbalDirection,
    moveWheel,
    moveGimbal,
  };
}
