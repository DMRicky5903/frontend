import asyncio

import cv2

from backend.core.config import (
    CAMERA_DEVICE_INDEX,
    CAMERA_FPS,
    CAMERA_HEIGHT,
    CAMERA_JPEG_QUALITY,
    CAMERA_WIDTH,
)
from backend.core.connection_manager import ConnectionManager


class CameraService:
    def __init__(self, manager: ConnectionManager) -> None:
        self.manager = manager
        self.capture: cv2.VideoCapture | None = None

    def _open(self) -> bool:
        self.capture = cv2.VideoCapture(CAMERA_DEVICE_INDEX)

        if not self.capture.isOpened():
            print("[Camera] Failed to open macOS camera")
            return False

        self.capture.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
        self.capture.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
        self.capture.set(cv2.CAP_PROP_FPS, CAMERA_FPS)

        print(
            f"[Camera] Opened device {CAMERA_DEVICE_INDEX} "
            f"at {CAMERA_WIDTH}x{CAMERA_HEIGHT}, {CAMERA_FPS} FPS"
        )

        return True

    async def stream_to_controller(self) -> None:
        if not self._open():
            return

        interval = 1 / CAMERA_FPS

        try:
            while True:
                if self.capture is None:
                    break

                success, frame = self.capture.read()

                if not success:
                    print("[Camera] Failed to read frame")
                    await asyncio.sleep(0.1)
                    continue

                success, jpeg = cv2.imencode(
                    ".jpg",
                    frame,
                    [
                        int(cv2.IMWRITE_JPEG_QUALITY),
                        CAMERA_JPEG_QUALITY,
                    ],
                )

                if not success:
                    continue

                await self.manager.send_bytes_to_controller(
                    jpeg.tobytes()
                )

                await asyncio.sleep(interval)

        finally:
            self.release()

    def release(self) -> None:
        if self.capture is not None:
            self.capture.release()
            self.capture = None
            print("[Camera] Released")
