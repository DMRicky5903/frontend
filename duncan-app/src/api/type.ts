// ==========================================
// 共用類型
// ==========================================

export type WheelDirection = "W" | "A" | "S" | "D" | "";
export type GimbalDirection = "I" | "J" | "K" | "L" | "";
export type RobotMode = 0 | 1 | 2;

export type WebSocketStatus =
  | "connecting"
  | "open"
  | "closed"
  | "error";

// ==========================================
// 前端 → 後端
// ==========================================

export type JoystickMessage = {
  type: "joystick";
  wheels: WheelDirection;
  gimbal: GimbalDirection;
};

export type ChatRequestMessage = {
  type: "chat";
  text: string;
};

export type SlamClickMessage = {
  type: "slamClick";
  x: number;
  y: number;
};

export type PingMessage = {
  type: "ping";
};

export type ClientMessage =
  | JoystickMessage
  | ChatRequestMessage
  | SlamClickMessage
  | PingMessage;

// ==========================================
// 後端 → 前端：JSON
// ==========================================

export type ChatResponseMessage = {
  type: "chat";
  content: string;
};

export type ControlStateMessage = {
  type: "controlState";
  controllerClientId: string | null;
};

export type ModeMessage = {
  type: "mode";
  mode: RobotMode;
};

export type SlamMapMessage = {
  type: "slamMap";
  /** base64-encoded JPEG image */
  image: string;
  resolution: number;
  origin: {
    x: number;
    y: number;
  };
};

export type SlamPoseMessage = {
  type: "slamPose";
  x: number;
  y: number;
  yaw: number;
};

export type SlamClickAckMessage = {
  type: "slamClickAck";
  x: number;
  y: number;
};

export type PongMessage = {
  type: "pong";
};

export type ClientIdentityMessage = {
  type: "clientIdentity";
  clientId: string;
};

export type JsonServerMessage =
  | ClientIdentityMessage
  | ChatResponseMessage
  | ControlStateMessage
  | ModeMessage
  | SlamMapMessage
  | SlamPoseMessage
  | SlamClickAckMessage
  | PongMessage;

// ==========================================
// 後端 → 前端：OpenCV camera binary
// ==========================================

/**
 * 目前 WebSocketClient 固定使用：
 * socket.binaryType = "blob"
 *
 * 因此 camera frame 會是 Blob，不會是 ArrayBuffer。
 */
export type CameraFrame = Blob;

export type ServerMessage = JsonServerMessage | CameraFrame;
