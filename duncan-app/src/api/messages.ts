// src/types/messages.ts

export type WheelDirection = "W" | "A" | "S" | "D" | "";
export type GimbalDirection = "I" | "J" | "K" | "L" | "";

// Client -> Server
export type JoystickMessage = {
  type: "joystick";
  clientId: string;
  wheels: WheelDirection;
  gimbal: GimbalDirection;
};

export type ChatRequestMessage = {
  type: "chat";
  clientId: string;
  text: string;
};

export type ClientMessage =
  | JoystickMessage
  | ChatRequestMessage;

// Server -> Client
export type ControlStateMessage = {
  type: "controlState";
  controllerClientId: string | null;
};

export type ChatResponseMessage = {
  type: "chat";
  content: string;
};

export type ServerMessage =
  | ControlStateMessage
  | ChatResponseMessage;
