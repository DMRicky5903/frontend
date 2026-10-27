// src/api/WebSocketClient.ts
import type {
  CameraFrame,
  ClientMessage,
  JsonServerMessage,
  WebSocketStatus,
} from "./type";

type JsonHandler = (message: JsonServerMessage) => void;
type BinaryHandler = (frame: CameraFrame) => void;
type StatusHandler = (status: WebSocketStatus) => void;

interface WebSocketClientOptions {
  url: string;
  heartbeatIntervalMs?: number;
  maxMissedPongs?: number;
}

export class WebSocketClient {
  private socket: WebSocket | null = null;

  private readonly url: string;
  private readonly heartbeatIntervalMs: number;
  private readonly maxMissedPongs: number;

  private jsonHandlers = new Set<JsonHandler>();
  private binaryHandlers = new Set<BinaryHandler>();
  private statusHandlers = new Set<StatusHandler>();
  private reconnectHandlers = new Set<() => void>();

  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;

  private reconnectAttempt = 0;
  private missedPongs = 0;
  private manuallyClosed = false;

  constructor(options: WebSocketClientOptions) {
    this.url = options.url;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? 25000;
    this.maxMissedPongs = options.maxMissedPongs ?? 3;
  }

  connect() {
    if (this.socket) return;

    this.manuallyClosed = false;

    const socket = new WebSocket(this.url);
    socket.binaryType = "blob"; // camera JPEG frame 使用 Blob

    this.socket = socket;
    this.emitStatus("connecting");

    socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.missedPongs = 0;
      this.startHeartbeat();
      this.emitStatus("open");
    };

    socket.onmessage = (event: MessageEvent<string | Blob | ArrayBuffer>) => {
      const data = event.data;

      // OpenCV / camera JPEG binary frame
      if (data instanceof Blob || data instanceof ArrayBuffer) {
        this.binaryHandlers.forEach((handler) => handler(data));
        return;
      }

      // JSON text frame
      if (typeof data === "string") {
        try {
          const message = JSON.parse(data) as JsonServerMessage;

          if (message.type === "pong") {
            this.missedPongs = 0;
            return;
          }

          this.jsonHandlers.forEach((handler) => handler(message));
        } catch (error) {
          console.error("[WebSocketClient] Invalid JSON message:", error);
        }
      }
    };

    socket.onerror = () => {
      this.emitStatus("error");
    };

    socket.onclose = () => {
      this.stopHeartbeat();
      this.socket = null;
      this.emitStatus("closed");

      if (!this.manuallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  send(message: ClientMessage) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.warn("[WebSocketClient] Cannot send; socket is not open.");
      return;
    }

    this.socket.send(JSON.stringify(message));
  }

  onJson(handler: JsonHandler) {
    this.jsonHandlers.add(handler);

    return () => {
      this.jsonHandlers.delete(handler);
    };
  }

  onBinary(handler: BinaryHandler) {
    this.binaryHandlers.add(handler);

    return () => {
      this.binaryHandlers.delete(handler);
    };
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler);

    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  /** 每次成功重連後會呼叫，適合重新要求 mode/controlState/slamMap */
  onReconnected(handler: () => void) {
    this.reconnectHandlers.add(handler);

    return () => {
      this.reconnectHandlers.delete(handler);
    };
  }

  close() {
    this.manuallyClosed = true;
    this.stopHeartbeat();

    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const socket = this.socket;
    this.socket = null;

    if (socket) {
      socket.onclose = null;
      socket.close();
    }

    this.emitStatus("closed");
  }

  private scheduleReconnect() {
    if (this.reconnectTimer !== null) return;

    const baseDelay = 1000;
    const maxDelay = 30000;

    const exponentialDelay = Math.min(
      maxDelay,
      baseDelay * 2 ** this.reconnectAttempt,
    );

    // 加一點隨機 jitter，避免大量 client 同一瞬間重連
    const delay = exponentialDelay + Math.random() * 500;

    this.reconnectAttempt += 1;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.missedPongs = 0;

    this.heartbeatTimer = window.setInterval(() => {
      if (this.missedPongs >= this.maxMissedPongs) {
        console.warn("[WebSocketClient] Heartbeat failed; closing socket.");
        this.socket?.close();
        return;
      }

      this.missedPongs += 1;
      this.send({ type: "ping" });
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer !== null) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private emitStatus(status: WebSocketStatus) {
    this.statusHandlers.forEach((handler) => handler(status));
  }
}
