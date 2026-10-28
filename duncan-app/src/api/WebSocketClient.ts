import type {
  CameraFrame,
  ClientMessage,
  JsonServerMessage,
  WebSocketStatus,
} from "./type";

type JsonHandler = (message: JsonServerMessage) => void;
type BinaryHandler = (frame: CameraFrame) => void;
type StatusHandler = (status: WebSocketStatus) => void;
type ReconnectedHandler = () => void;

interface WebSocketClientOptions {
  url: string;
  heartbeatIntervalMs?: number;
  maxMissedPongs?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketClient {
  private socket: WebSocket | null = null;

  private readonly url: string;
  private readonly heartbeatIntervalMs: number;
  private readonly maxMissedPongs: number;
  private readonly maxReconnectAttempts: number;

  private readonly jsonHandlers = new Set<JsonHandler>();
  private readonly binaryHandlers = new Set<BinaryHandler>();
  private readonly statusHandlers = new Set<StatusHandler>();
  private readonly reconnectHandlers = new Set<ReconnectedHandler>();

  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;

  private reconnectAttempt = 0;
  private missedPongs = 0;
  private manuallyClosed = false;
  private hasConnectedBefore = false;

  constructor(options: WebSocketClientOptions) {
    this.url = options.url;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? 25000;
    this.maxMissedPongs = options.maxMissedPongs ?? 3;
    this.maxReconnectAttempts =
      options.maxReconnectAttempts ?? 10;
  }

  connect() {
    if (this.socket) {
      return;
    }

    this.manuallyClosed = false;

    const socket = new WebSocket(this.url);
    socket.binaryType = "blob";

    this.socket = socket;
    this.emitStatus("connecting");

    socket.onopen = () => {
      const isReconnect = this.hasConnectedBefore;

      this.reconnectAttempt = 0;
      this.missedPongs = 0;
      this.hasConnectedBefore = true;

      this.startHeartbeat();
      this.emitStatus("open");

      if (isReconnect) {
        this.reconnectHandlers.forEach((handler) => handler());
      }
    };

    socket.onmessage = (event: MessageEvent<string | Blob>) => {
      const data = event.data;

      // OpenCV / camera JPEG binary frame
      if (data instanceof Blob) {
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
          console.error(
            "[WebSocketClient] Invalid JSON message:",
            error,
          );
        }
      }
    };

    socket.onerror = () => {
      // 瀏覽器通常會在 error 後接著觸發 close；
      // 這裡不直接設為 closed，讓 onclose 依 wasClean 判斷。
      this.emitStatus("error");
    };

    socket.onclose = (event: CloseEvent) => {
      this.stopHeartbeat();
      this.socket = null;

      const nextStatus: WebSocketStatus = event.wasClean
        ? "closed"
        : "error";

      this.emitStatus(nextStatus);

      if (!this.manuallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  send(message: ClientMessage): boolean {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.warn(
        "[WebSocketClient] Cannot send; socket is not open.",
      );
      return false;
    }

    this.socket.send(JSON.stringify(message));
    return true;
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

  /**
   * 每次成功重連後會呼叫。
   * 適合重新同步 mode / controlState 等伺服器狀態。
   */
  onReconnected(handler: ReconnectedHandler) {
    this.reconnectHandlers.add(handler);

    return () => {
      this.reconnectHandlers.delete(handler);
    };
  }

  reconnect() {
    this.reconnectAttempt = 0;
    this.connect();
  }

  close() {
    this.manuallyClosed = true;
    this.hasConnectedBefore = false;

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
    if (this.reconnectTimer !== null) {
      return;
    }

    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      console.warn(
        "[WebSocketClient] Max reconnect attempts reached.",
      );
      this.emitStatus("error");
      return;
    }

    const baseDelay = 1000;
    const maxDelay = 30000;

    const exponentialDelay = Math.min(
      maxDelay,
      baseDelay * 2 ** this.reconnectAttempt,
    );

    // 加入 jitter，避免大量 client 同一瞬間重連
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
        console.warn(
          "[WebSocketClient] Heartbeat failed; closing socket.",
        );

        this.socket?.close();
        return;
      }

      // 先送 ping；下一次 interval 才檢查是否收到 pong。
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
