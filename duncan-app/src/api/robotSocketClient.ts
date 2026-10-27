export type SocketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

type SocketClientOptions = {
  url: string;
  reconnectDelay?: number;
};

export class SocketClient<TIncoming, TOutgoing> {
  private url: string;
  private reconnectDelay: number;

  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private shouldReconnect = false;

  private messageHandlers = new Set<(message: TIncoming) => void>();
  private statusHandlers = new Set<(status: SocketStatus) => void>();

  private _status: SocketStatus = "idle";

  constructor({ url, reconnectDelay = 3000 }: SocketClientOptions) {
    this.url = url;
    this.reconnectDelay = reconnectDelay;
  }

  get status() {
    return this._status;
  }

  connect() {
    this.clearReconnectTimer();

    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    this.shouldReconnect = true;
    this.setStatus("connecting");

    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.onopen = () => this.setStatus("connected");

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as TIncoming;
      this.messageHandlers.forEach((handler) => handler(message));
    };

    socket.onerror = () => this.setStatus("error");

    socket.onclose = () => {
      this.socket = null;
      this.setStatus("disconnected");

      if (this.shouldReconnect) {
        this.reconnectTimer = window.setTimeout(() => {
          this.connect();
        }, this.reconnectDelay);
      }
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    this.clearReconnectTimer();

    this.socket?.close();
    this.socket = null;
    this.setStatus("idle");
  }

  send(message: TOutgoing) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      throw new Error("Socket is not connected");
    }

    this.socket.send(JSON.stringify(message));
  }

  subscribe(handler: (message: TIncoming) => void) {
    this.messageHandlers.add(handler);

    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onStatusChange(handler: (status: SocketStatus) => void) {
    this.statusHandlers.add(handler);
    handler(this._status);

    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  private setStatus(status: SocketStatus) {
    this._status = status;
    this.statusHandlers.forEach((handler) => handler(status));
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
