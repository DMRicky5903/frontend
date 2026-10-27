// src/api/WebSocketProvider.tsx
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { WebSocketClient } from "./WebSocketClient";
import type {
  CameraFrame,
  ClientMessage,
  JsonServerMessage,
  WebSocketStatus,
} from "./type";

export interface WebSocketContextValue {
  status: WebSocketStatus;
  send: (message: ClientMessage) => void;
  subscribeJson: (
    handler: (message: JsonServerMessage) => void,
  ) => () => void;
  subscribeBinary: (
    handler: (frame: CameraFrame) => void,
  ) => () => void;
  onReconnected: (handler: () => void) => () => void;
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(
  null,
);

interface WebSocketProviderProps {
  url: string;
  children: ReactNode;
}

export function WebSocketProvider({ url, children }: WebSocketProviderProps) {
  const [client] = useState(
    () =>
      new WebSocketClient({
        url,
        heartbeatIntervalMs: 25000,
        maxMissedPongs: 3,
      }),
  );

  const [status, setStatus] = useState<WebSocketStatus>("connecting");

  useEffect(() => {
    const unsubscribeStatus = client.onStatus(setStatus);

    const unsubscribeReconnect = client.onReconnected(() => {
      // 重連後，讓需要重新同步的 feature hook 自行處理。
      // 例如重新要求 mode、controlState、slamMap。
    });

    client.connect();

    return () => {
      unsubscribeStatus();
      unsubscribeReconnect();
      client.close();
    };
  }, [client]);

  const send = useCallback(
    (message: ClientMessage) => {
      client.send(message);
    },
    [client],
  );

  const subscribeJson = useCallback(
    (handler: (message: JsonServerMessage) => void) => {
      return client.onJson(handler);
    },
    [client],
  );

  const subscribeBinary = useCallback(
    (handler: (frame: CameraFrame) => void) => {
      return client.onBinary(handler);
    },
    [client],
  );

  const handleReconnected = useCallback(
    (handler: () => void) => {
      return client.onReconnected(handler);
    },
    [client],
  );

  const value = useMemo<WebSocketContextValue>(
    () => ({
      status,
      send,
      subscribeJson,
      subscribeBinary,
      onReconnected: handleReconnected,
    }),
    [status, send, subscribeJson, subscribeBinary, handleReconnected],
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
