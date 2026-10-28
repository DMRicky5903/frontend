import { useCallback, useState } from "react";

import {
  useWebSocketJson,
  useWebSocketSend,
} from "../../../api/useWebSocket";

import type {
  JsonServerMessage,
  SlamMapMessage,
  SlamPoseMessage,
} from "../../../api/type";

import {
  MOCK_SLAM_MAP,
  MOCK_SLAM_POSE,
  USE_MOCK_SLAM_MAP,
} from "../mockSlamMap";

type SlamDestination = {
  x: number;
  y: number;
};

type SlamPendingClick = {
  x: number;
  y: number;
};

type UseSlamMapOptions = {
  enabled?: boolean;
};

export function useSlamMap({ enabled = true }: UseSlamMapOptions = {}) {
  const send = useWebSocketSend();

  const [slamMap, setSlamMap] = useState<SlamMapMessage | null>(null);
  const [robotPose, setRobotPose] = useState<SlamPoseMessage | null>(null);
  const [destination, setDestination] = useState<SlamDestination | null>(
    null,
  );
  const [pendingClick, setPendingClick] =
    useState<SlamPendingClick | null>(null);

  useWebSocketJson(
    useCallback((message: JsonServerMessage) => {
      if (message.type === "slamMap") {
        setSlamMap(message);
        setDestination(null);
        setPendingClick(null);
        return;
      }

      if (message.type === "slamPose") {
        setRobotPose(message);
        return;
      }

      if (message.type === "slamClickAck") {
        setDestination({
          x: message.x,
          y: message.y,
        });

        setPendingClick(null);
      }
    }, []),
  );

  const handleMapClick = useCallback(
    (x: number, y: number) => {
      if (!enabled) {
        return;
      }

      setDestination(null);
      setPendingClick({ x, y });

      send({
        type: "slamClick",
        x,
        y,
      });
    },
    [enabled, send],
  );

  const effectiveSlamMap =
    slamMap ?? (USE_MOCK_SLAM_MAP ? MOCK_SLAM_MAP : null);

  const effectiveRobotPose =
    robotPose ?? (USE_MOCK_SLAM_MAP ? MOCK_SLAM_POSE : null);

  return {
    slamMap: effectiveSlamMap,
    robotPose: effectiveRobotPose,
    destination,
    pendingClick,
    handleMapClick,
  };
}
