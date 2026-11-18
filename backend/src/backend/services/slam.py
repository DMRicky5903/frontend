import base64
from pathlib import Path

from backend.core.config import (
    MAP_ORIGIN_X,
    MAP_ORIGIN_Y,
    MAP_PATH,
    MAP_RESOLUTION,
)
from backend.core.connection_manager import ConnectionManager
from backend.core.protocol import SlamMapMessage


class SlamService:
    def __init__(self, manager: ConnectionManager) -> None:
        self.manager = manager
        self.map_message: SlamMapMessage | None = None

    def load_map(self) -> bool:
        if not MAP_PATH.exists():
            print(f"[SLAM] Map not found: {MAP_PATH}")
            return False

        image_bytes = Path(MAP_PATH).read_bytes()
        base64_image = base64.b64encode(image_bytes).decode("ascii")

        self.map_message = SlamMapMessage(
            image=f"data:image/png;base64,{base64_image}",
            resolution=MAP_RESOLUTION,
            origin={
                "x": MAP_ORIGIN_X,
                "y": MAP_ORIGIN_Y,
            },
        )

        print(f"[SLAM] Loaded map: {MAP_PATH}")
        return True

    async def send_map_to_controller(self) -> bool:
        if self.map_message is None:
            return False

        return await self.manager.send_to_controller(
            self.map_message
        )