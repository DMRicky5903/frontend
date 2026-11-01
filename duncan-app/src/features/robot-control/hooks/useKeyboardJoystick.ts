import { useEffect, useRef } from "react";

type Direction = "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT";

type UseKeyboardJoystickOptions = {
  onLeftChange: (direction: Direction | "") => void;
  onRightChange: (direction: Direction | "") => void;
  repeatInterval?: number;
};

const LEFT_KEY_MAP: Record<string, Direction> = {
  w: "FORWARD",
  s: "BACKWARD",
  a: "LEFT",
  d: "RIGHT",
};

const RIGHT_KEY_MAP: Record<string, Direction> = {
  i: "FORWARD",
  k: "BACKWARD",
  j: "LEFT",
  l: "RIGHT",
};

export function useKeyboardJoystick({
  onLeftChange,
  onRightChange,
  repeatInterval = 120,
}: UseKeyboardJoystickOptions) {
  const pressedKeys = useRef<string[]>([]);
  const leftDirectionRef = useRef<Direction | "">("");
  const rightDirectionRef = useRef<Direction | "">("");
  const repeatTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const getLatestDirection = (
      keyMap: Record<string, Direction>,
    ): Direction | "" => {
      for (
        let index = pressedKeys.current.length - 1;
        index >= 0;
        index -= 1
      ) {
        const key = pressedKeys.current[index];
        const direction = keyMap[key];

        if (direction) {
          return direction;
        }
      }

      return "";
    };

    const updateDirections = () => {
      const leftDirection = getLatestDirection(LEFT_KEY_MAP);
      const rightDirection = getLatestDirection(RIGHT_KEY_MAP);

      if (leftDirection !== leftDirectionRef.current) {
        leftDirectionRef.current = leftDirection;
        onLeftChange(leftDirection);
      }

      if (rightDirection !== rightDirectionRef.current) {
        rightDirectionRef.current = rightDirection;
        onRightChange(rightDirection);
      }
    };

    const startRepeat = () => {
      if (repeatTimerRef.current !== null) {
        return;
      }

      repeatTimerRef.current = window.setInterval(() => {
        if (leftDirectionRef.current) {
          onLeftChange(leftDirectionRef.current);
        }

        if (rightDirectionRef.current) {
          onRightChange(rightDirectionRef.current);
        }
      }, repeatInterval);
    };

    const stopRepeat = () => {
      if (repeatTimerRef.current === null) {
        return;
      }

      window.clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (!LEFT_KEY_MAP[key] && !RIGHT_KEY_MAP[key]) {
        return;
      }

      event.preventDefault();

      if (!pressedKeys.current.includes(key)) {
        pressedKeys.current.push(key);
        updateDirections();
      }

      startRepeat();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      pressedKeys.current = pressedKeys.current.filter(
        (pressedKey) => pressedKey !== key,
      );

      updateDirections();

      if (
        pressedKeys.current.length === 0
      ) {
        stopRepeat();
      }
    };

    const handleBlur = () => {
      pressedKeys.current = [];
      leftDirectionRef.current = "";
      rightDirectionRef.current = "";

      onLeftChange("");
      onRightChange("");

      stopRepeat();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);

      stopRepeat();
    };
  }, [onLeftChange, onRightChange, repeatInterval]);
}
