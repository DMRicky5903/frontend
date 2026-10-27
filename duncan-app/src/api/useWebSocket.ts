// src/api/useWebSocket.ts
import { useContext, useEffect } from "react";
import { WebSocketContext } from "./WebSocketProvider";
import type {
  CameraFrame,
  ClientMessage,
  JsonServerMessage,
  WebSocketStatus,
} from "./type";

export function useWebSocket() {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error(
      "useWebSocket must be used inside <WebSocketProvider>.",
    );
  }

  return context;
}

export function useWebSocketStatus(): WebSocketStatus {
  return useWebSocket().status;
}

export function useWebSocketSend() {
  return useWebSocket().send;
}

export function useWebSocketJson(
  handler: (message: JsonServerMessage) => void,
) {
  const { subscribeJson } = useWebSocket();

  useEffect(() => {
    return subscribeJson(handler);
  }, [subscribeJson, handler]);
}

export function useWebSocketCameraFrame(
  handler: (frame: CameraFrame) => void,
) {
  const { subscribeBinary } = useWebSocket();

  useEffect(() => {
    return subscribeBinary(handler);
  }, [subscribeBinary, handler]);
}

export function useWebSocketReconnected(handler: () => void) {
  const { onReconnected } = useWebSocket();

  useEffect(() => {
    return onReconnected(handler);
  }, [onReconnected, handler]);
}

// WebSocketProvider  必須包住  RouterProvider ，整個 app 只會有一條 WebSocket。
// •	任何 component 都可用  useWebSocket() ，但建議 component 只呼叫 feature hook，例如  useChat() 、 useCameraFeed() 、 useRobotControl() 。
// •	 useWebSocketJson  的 handler 請用  useCallback ，避免每次 render 都取消再重新訂閱。
// •	Camera 的  Blob  URL 用完要  URL.revokeObjectURL() ，否則長時間直播會累積記憶體。
// •	後端收到  { "type": "ping" }  時，要回  { "type": "pong" } ；否則 client 會在連續 3 次未收到 pong後主動斷線並重連。[dev +1]