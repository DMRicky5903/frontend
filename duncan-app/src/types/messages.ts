export type LeftDirection = "W" | "A" | "S" | "D" | "";
export type RightDirection = "I" | "J" | "K" | "L" | "";

export type JoystickMessage = {
  type: "joystick";
  left: LeftDirection;
  right: RightDirection;
};

export type StatusMessage = {
  type: "status";
  lock: boolean;
};

export type TextMessage = {
  type: "text";
  text: string;
};
