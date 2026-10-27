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
} from "../mock/mockSlamMap";

// ==========================================
// SLAM UI 內部狀態
// 這些不是 WebSocket 協定，不放在 api/type.ts
// ==========================================

type SlamDestination = {
  x: number;
  y: number;
};

type SlamPendingClick = {
  x: number;
  y: number;
};

export function useSlamMap() {
  const send = useWebSocketSend();

  const [slamMap, setSlamMap] = useState<SlamMapMessage | null>(null);
  const [robotPose, setRobotPose] = useState<SlamPoseMessage | null>(null);

  // 後端 slamClickAck 確認後的旗標
  const [destination, setDestination] = useState<SlamDestination | null>(null);

  // 使用者點擊後、收到 ack 前的 pending 圓點
  const [pendingClick, setPendingClick] =
    useState<SlamPendingClick | null>(null);

  useWebSocketJson(
    useCallback((message: JsonServerMessage) => {
      if (message.type === "slamMap") {
        setSlamMap(message);

        // 收到新地圖時，重置目的地
        setDestination(null);
        setPendingClick(null);
        return;
      }

      if (message.type === "slamPose") {
        setRobotPose(message);
        return;
      }

      if (message.type === "slamClickAck") {
        // 直接採用後端回傳的位置
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
      // 只允許一個目的地：
      // 新點擊會移除舊旗標與舊 pending
      setDestination(null);
      setPendingClick({ x, y });

      send({
        type: "slamClick",
        x,
        y,
      });
    },
    [send],
  );

  // 測試用：沒有收到真 slamMap 時使用假地圖
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
