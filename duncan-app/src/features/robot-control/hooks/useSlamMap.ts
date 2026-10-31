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

// 讓使用者離開 SLAM 頁面後，
// 重新進入時仍能立即顯示最後一次收到的地圖。
let lastSlamMap: SlamMapMessage | null = null;

export function useSlamMap({
  enabled = true,
}: UseSlamMapOptions = {}) {
  const send = useWebSocketSend();

  const [slamMap, setSlamMap] = useState<SlamMapMessage | null>(
    lastSlamMap,
  );

  const [robotPose, setRobotPose] =
    useState<SlamPoseMessage | null>(null);

  const [destination, setDestination] =
    useState<SlamDestination | null>(null);

  const [pendingClick, setPendingClick] =
    useState<SlamPendingClick | null>(null);

  useWebSocketJson(
    useCallback((message: JsonServerMessage) => {
      if (message.type === "slamMap") {
        lastSlamMap = message;
        setSlamMap(message);
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

  return {
    slamMap,
    robotPose,
    destination,
    pendingClick,
    handleMapClick,
  };
}
