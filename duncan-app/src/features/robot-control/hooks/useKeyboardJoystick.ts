import { useEffect, useRef } from "react";

type Direction = "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT";

type UseKeyboardJoystickOptions = {
  onLeftChange: (direction: Direction | "") => void;
  onRightChange: (direction: Direction | "") => void;
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
}: UseKeyboardJoystickOptions) {
  const pressedKeys = useRef<string[]>([]);

  useEffect(() => {
    const getLatestDirection = (
      keyMap: Record<string, Direction>,
    ): Direction | "" => {
      for (let index = pressedKeys.current.length - 1; index >= 0; index -= 1) {
        const key = pressedKeys.current[index];
        const direction = keyMap[key];

        if (direction) {
          return direction;
        }
      }

      return "";
    };

    const updateDirections = () => {
      onLeftChange(getLatestDirection(LEFT_KEY_MAP));
      onRightChange(getLatestDirection(RIGHT_KEY_MAP));
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
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      pressedKeys.current = pressedKeys.current.filter(
        (pressedKey) => pressedKey !== key,
      );

      updateDirections();
    };

    const handleBlur = () => {
      pressedKeys.current = [];
      updateDirections();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [onLeftChange, onRightChange]);
}
