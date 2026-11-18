import asyncio
import json
import uuid
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from backend.core.protocol import (
    ClientIdentityMessage,
    ControlStateMessage,
    ModeMessage,
)


class ConnectionManager:
    def __init__(self) -> None:
        self.connections: dict[str, WebSocket] = {}
        self.controller_client_id: str | None = None
        self.mode: int = 0
        self._lock = asyncio.Lock()

    @property
    def controller(self) -> WebSocket | None:
        if self.controller_client_id is None:
            return None

        return self.connections.get(self.controller_client_id)

    def is_controller(self, client_id: str) -> bool:
        return self.controller_client_id == client_id

    def is_websocket_connected(
        self,
        websocket: WebSocket,
    ) -> bool:
        return (
            websocket.client_state.name == "CONNECTED"
            and websocket.application_state.name == "CONNECTED"
        )

    async def connect(self, websocket: WebSocket) -> str:
        await websocket.accept()

        client_id = str(uuid.uuid4())
        self.connections[client_id] = websocket

        print(f"[WebSocket] Connected: {client_id}")

        if self.controller_client_id is None:
            self.controller_client_id = client_id
            print(f"[Controller] Assigned: {client_id}")

        await self.send_personal_message(
            client_id,
            ClientIdentityMessage(clientId=client_id),
        )

        await self.broadcast_control_state()
        await self.broadcast_mode()

        return client_id

    async def disconnect(self, client_id: str) -> None:
        # 1. 先從 active connections 移除
        self.connections.pop(client_id, None)

        print(f"[WebSocket] Disconnected: {client_id}")

        # 2. 若斷線者是 controller，清空並移交
        if self.controller_client_id == client_id:
            self.controller_client_id = None
            print("[Controller] Controller disconnected; cleared")

            self._reassign_controller_if_needed()

        # 3. 最後才廣播；此時已斷線的 client 不在 connections 中
        await self.broadcast_control_state()

    async def send_personal_message(
        self,
        client_id: str,
        message: Any,
    ) -> bool:
        websocket = self.connections.get(client_id)

        if websocket is None:
            return False

        if not self.is_websocket_connected(websocket):
            self._remove_client(client_id)
            return False

        try:
            if isinstance(message, BaseModel):
                payload = message.model_dump_json()
            else:
                payload = json.dumps(message, ensure_ascii=False)

            await websocket.send_text(payload)
            return True

        except WebSocketDisconnect:
            print(
                f"[WebSocket] Client disconnected while sending: "
                f"{client_id}"
            )

            self._remove_client(client_id)
            return False

        except Exception as error:
            print(
                f"[WebSocket] Send failed to {client_id}: "
                f"{type(error).__name__}: {error}"
            )

            self._remove_client(client_id)
            return False

    async def send_bytes_to_controller(self, data: bytes) -> bool:
        websocket = self.controller

        if websocket is None:
            return False

        if not self.is_websocket_connected(websocket):
            self._remove_client(self.controller_client_id)
            return False

        try:
            await websocket.send_bytes(data)
            return True

        except WebSocketDisconnect:
            print(
                "[Camera] Controller disconnected while sending frame"
            )

            if self.controller_client_id is not None:
                self._remove_client(self.controller_client_id)

            return False

        except Exception as error:
            print(
                f"[Camera] Send failed: "
                f"{type(error).__name__}: {error}"
            )

            if self.controller_client_id is not None:
                self._remove_client(self.controller_client_id)

            return False

    async def send_to_controller(self, message: Any) -> bool:
        if self.controller_client_id is None:
            return False

        return await self.send_personal_message(
            self.controller_client_id,
            message,
        )

    async def broadcast(self, message: Any) -> None:
        if isinstance(message, BaseModel):
            payload = message.model_dump_json()
        else:
            payload = json.dumps(message, ensure_ascii=False)

        failed_clients: list[str] = []

        for client_id in list(self.connections.keys()):
            websocket = self.connections.get(client_id)

            if websocket is None:
                failed_clients.append(client_id)
                continue

            if not self.is_websocket_connected(websocket):
                failed_clients.append(client_id)
                continue

            try:
                await websocket.send_text(payload)

            except WebSocketDisconnect:
                print(
                    f"[WebSocket] Client disconnected during broadcast: "
                    f"{client_id}"
                )

                failed_clients.append(client_id)

            except Exception as error:
                print(
                    f"[WebSocket] Broadcast failed to {client_id}: "
                    f"{type(error).__name__}: {error}"
                )

                failed_clients.append(client_id)

        for client_id in failed_clients:
            self._remove_client(client_id)

    async def broadcast_control_state(self) -> None:
        await self.broadcast(
            ControlStateMessage(
                controllerClientId=self.controller_client_id,
            )
        )

    async def broadcast_mode(self) -> None:
        await self.broadcast(
            ModeMessage(mode=self.mode)
        )

    async def cycle_mode(self) -> None:
        self.mode = (self.mode + 1) % 3

        print(f"[Mode] Changed to {self.mode}")

        await self.broadcast_mode()

    def _reassign_controller_if_needed(self) -> None:
        if self.controller_client_id is not None:
            return

        if not self.connections:
            return

        new_controller_id = next(iter(self.connections))

        self.controller_client_id = new_controller_id

        print(
            f"[Controller] Reassigned to: {new_controller_id}"
        )

    def _remove_client(self, client_id: str | None) -> None:
        if client_id is None:
            return

        self.connections.pop(client_id, None)

        if self.controller_client_id == client_id:
            self.controller_client_id = None
            print("[Controller] Controller connection lost; cleared")

            self._reassign_controller_if_needed()
