import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { WebSocketClient } from "./WebSocketClient";

import type {
  CameraFrame,
  ClientMessage,
  JsonServerMessage,
  RobotMode,
  WebSocketStatus,
} from "./type";

export interface WebSocketContextValue {
  status: WebSocketStatus;
  clientId: string | null;
  mode: RobotMode | null;
  controllerClientId: string | null;
  send: (message: ClientMessage) => boolean;
  subscribeJson: (
    handler: (message: JsonServerMessage) => void,
  ) => () => void;
  subscribeBinary: (
    handler: (frame: CameraFrame) => void,
  ) => () => void;
  onReconnected: (handler: () => void) => () => void;
  reconnect: () => void;
}

export const WebSocketContext =
  createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  url: string;
  token?: string | null;
  children: ReactNode;
}

export function WebSocketProvider({
  url,
  token,
  children,
}: WebSocketProviderProps) {
  const clientRef = useRef<{
    key: string;
    client: WebSocketClient;
  } | null>(null);

  const [status, setStatus] = useState<WebSocketStatus>("connecting");
  const [clientId, setClientId] = useState<string | null>(null);
  const [mode, setMode] = useState<RobotMode | null>(null);
  const [controllerClientId, setControllerClientId] = useState<
    string | null
  >(null);

  const connectionKey = `${url}|${token ?? ""}`;

  // 依 url / token 建立或重建 WebSocketClient。
  if (
    !clientRef.current ||
    clientRef.current.key !== connectionKey
  ) {
    clientRef.current?.client.close();

    const wsUrl = new URL(url, window.location.origin);

    if (token) {
      wsUrl.searchParams.set("token", token);
    }

    clientRef.current = {
      key: connectionKey,
      client: new WebSocketClient({
        url: wsUrl.toString(),
        heartbeatIntervalMs: 25000,
        maxMissedPongs: 3,
        maxReconnectAttempts: 10,
      }),
    };
  }

  const client = clientRef.current.client;

  useEffect(() => {
    const unsubscribeStatus = client.onStatus((nextStatus) => {
      setStatus(nextStatus);

      // WebSocket 斷線或錯誤時，先取消本端的控制權。
      // 後端重連後會透過 mode / controlState 重新同步。
      if (nextStatus === "closed" || nextStatus === "error") {
        setControllerClientId(null);
      }
    });

    const unsubscribeJson = client.onJson((message) => {
      if (message.type === "clientIdentity") {
        setClientId(message.clientId);
      }

      if (message.type === "mode") {
        setMode(message.mode);
      }

      if (message.type === "controlState") {
        setControllerClientId(message.controllerClientId);
      }
    });

    const unsubscribeReconnect = client.onReconnected(() => {
      // 重連後等待後端推送 mode / controlState / slamMap。
    });

    client.connect();

    return () => {
      unsubscribeStatus();
      unsubscribeJson();
      unsubscribeReconnect();
      client.close();
    };
  }, [client]);


  const send = useCallback(
    (message: ClientMessage) => {
      return client.send(message);
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

  const reconnect = useCallback(() => {
    client.reconnect();
  }, [client]);

  const value = useMemo<WebSocketContextValue>(
    () => ({
      status,
      clientId,
      mode,
      controllerClientId,
      send,
      subscribeJson,
      subscribeBinary,
      onReconnected: handleReconnected,
      reconnect,
    }),
    [
      status,
      clientId,
      mode,
      controllerClientId,
      send,
      subscribeJson,
      subscribeBinary,
      handleReconnected,
      reconnect,
    ],
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
