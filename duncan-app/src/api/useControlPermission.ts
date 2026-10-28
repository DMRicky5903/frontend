import { useMemo } from "react";

import { useRobotIdentity } from "./useWebSocket";

import type { RobotMode } from "./type";

type ControlPermission = {
  mode: RobotMode | null;
  currentClientId: string | null;
  controllerClientId: string | null;
  isCurrentController: boolean;
  canSend: boolean;
};

export function useControlPermission(
  requiredMode: RobotMode,
): ControlPermission {
  const {
    mode,
    clientId,
    controllerClientId,
    isCurrentController,
  } = useRobotIdentity();

  const canSend = useMemo(() => {
    return mode === requiredMode && isCurrentController;
  }, [mode, requiredMode, isCurrentController]);

  return {
    mode,
    currentClientId: clientId,
    controllerClientId,
    isCurrentController,
    canSend,
  };
}
