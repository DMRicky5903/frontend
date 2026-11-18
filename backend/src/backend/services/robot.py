import asyncio

from backend.core.connection_manager import ConnectionManager
from backend.core.protocol import SlamPoseMessage


class RobotSimulator:
    def __init__(self, manager: ConnectionManager) -> None:
        self.manager = manager

        self.x = 0.0
        self.y = 0.0
        self.yaw = 0.0

        self.destination: tuple[float, float] | None = None
        self._navigation_task: asyncio.Task | None = None

    def apply_joystick(
        self,
        wheels: str,
        gimbal: str,
    ) -> None:
        if wheels == "W":
            self.y += 0.1
        elif wheels == "S":
            self.y -= 0.1
        elif wheels == "A":
            self.x -= 0.1
        elif wheels == "D":
            self.x += 0.1

        if gimbal == "J":
            self.yaw += 0.1
        elif gimbal == "L":
            self.yaw -= 0.1

        print(
            f"[Joystick] wheels={wheels or '-'} "
            f"gimbal={gimbal or '-'} "
            f"pose=({self.x:.2f}, {self.y:.2f}, {self.yaw:.2f})"
        )

    def teleport_to(self, x: float, y: float) -> None:
        print(
            f"[SLAM Click] Teleport to ({x:.2f}, {y:.2f})"
        )

        self.x = x
        self.y = y
        self.destination = None

        if self._navigation_task is not None:
            self._navigation_task.cancel()
            self._navigation_task = None

    async def broadcast_pose_loop(self) -> None:
        while True:
            await self.manager.send_to_controller(
                SlamPoseMessage(
                    x=self.x,
                    y=self.y,
                    yaw=self.yaw,
                )
            )

            await asyncio.sleep(0.1)
