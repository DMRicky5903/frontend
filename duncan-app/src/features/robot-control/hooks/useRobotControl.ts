import { useCallback, useState } from "react";

import { useWebSocketSend } from "../../../api/useWebSocket";

import type {
  GimbalDirection,
  WheelDirection,
} from "../../../api/type";

type UseRobotControlOptions = {
  enabled?: boolean;
};

export function useRobotControl({
  enabled = true,
}: UseRobotControlOptions = {}) {
  const [wheelDirection, setWheelDirection] =
    useState<WheelDirection>("");

  const [gimbalDirection, setGimbalDirection] =
    useState<GimbalDirection>("");

  const send = useWebSocketSend();

  const moveWheel = useCallback(
    (direction: WheelDirection) => {
      setWheelDirection(direction);

      if (!enabled) {
        return;
      }

      send({
        type: "joystick",
        wheels: direction,
        gimbal: gimbalDirection,
      });
    },
    [enabled, gimbalDirection, send],
  );

  const moveGimbal = useCallback(
    (direction: GimbalDirection) => {
      setGimbalDirection(direction);

      if (!enabled) {
        return;
      }

      send({
        type: "joystick",
        wheels: wheelDirection,
        gimbal: direction,
      });
    },
    [enabled, wheelDirection, send],
  );

  return {
    wheelDirection,
    gimbalDirection,
    moveWheel,
    moveGimbal,
  };
}


// import { useCallback, useEffect, useRef, useState } from "react";

// import { useWebSocketSend } from "../../../api/useWebSocket";

// import type {
//   GimbalDirection,
//   WheelDirection,
// } from "../../../api/type";

// type UseRobotControlOptions = {
//   enabled?: boolean;
// };

// export function useRobotControl({
//   enabled = true,
// }: UseRobotControlOptions = {}) {
//   const [wheelDirection, setWheelDirection] =
//     useState<WheelDirection>("");

//   const [gimbalDirection, setGimbalDirection] =
//     useState<GimbalDirection>("");

//   const wheelDirectionRef = useRef<WheelDirection>("");
//   const gimbalDirectionRef = useRef<GimbalDirection>("");

//   const send = useWebSocketSend();

//   useEffect(() => {
//     if (enabled) {
//       return;
//     }

//     // 失去控制權時，立刻停止 UI 狀態，
//     // 避免 joystick 看起來仍在前進或轉頭。
//     wheelDirectionRef.current = "";
//     gimbalDirectionRef.current = "";

//     setWheelDirection("");
//     setGimbalDirection("");
//   }, [enabled]);

//   const moveWheel = useCallback(
//     (direction: WheelDirection) => {
//       if (!enabled) {
//         return;
//       }

//       wheelDirectionRef.current = direction;
//       setWheelDirection(direction);

//       send({
//         type: "joystick",
//         wheels: direction,
//         gimbal: gimbalDirectionRef.current,
//       });
//     },
//     [enabled, send],
//   );

//   const moveGimbal = useCallback(
//     (direction: GimbalDirection) => {
//       if (!enabled) {
//         return;
//       }

//       gimbalDirectionRef.current = direction;
//       setGimbalDirection(direction);

//       send({
//         type: "joystick",
//         wheels: wheelDirectionRef.current,
//         gimbal: direction,
//       });
//     },
//     [enabled, send],
//   );

//   return {
//     wheelDirection,
//     gimbalDirection,
//     moveWheel,
//     moveGimbal,
//   };
// }
