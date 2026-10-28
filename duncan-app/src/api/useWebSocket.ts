import { useContext, useEffect, useRef } from "react";

import { WebSocketContext } from "./WebSocketProvider";

import type {
  CameraFrame,
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
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    return subscribeJson((message) => {
      handlerRef.current(message);
    });
  }, [subscribeJson]);
}

export function useWebSocketCameraFrame(
  handler: (frame: CameraFrame) => void,
) {
  const { subscribeBinary } = useWebSocket();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    return subscribeBinary((frame) => {
      handlerRef.current(frame);
    });
  }, [subscribeBinary]);
}

export function useWebSocketReconnected(handler: () => void) {
  const { onReconnected } = useWebSocket();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    return onReconnected(() => {
      handlerRef.current();
    });
  }, [onReconnected]);
}

export function useRobotIdentity() {
  const { clientId, mode, controllerClientId } = useWebSocket();

  const isCurrentController = Boolean(
    clientId &&
      controllerClientId &&
      clientId === controllerClientId,
  );

  return {
    clientId,
    mode,
    controllerClientId,
    isCurrentController,
  };
}
