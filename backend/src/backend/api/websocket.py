import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from backend.core.connection_manager import ConnectionManager
from backend.core.protocol import (
    ChatMessage,
    CycleModeMessage,
    JoystickMessage,
    PingMessage,
    SlamClickMessage,
)
from backend.services.chat import ChatService
from backend.services.robot import RobotSimulator
from backend.services.slam import SlamService

router = APIRouter()

manager = ConnectionManager()
robot = RobotSimulator(manager)
slam = SlamService(manager)
chat = ChatService(manager)


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    client_id = await manager.connect(websocket)

    if slam.map_message is None:
        slam.load_map()

    await slam.send_map_to_controller()

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)

            message_type = data.get("type")

            if message_type == "ping":
                await manager.send_personal_message(
                    client_id,
                    {"type": "pong"},
                )

            elif message_type == "joystick":
                message = JoystickMessage(**data)

                print(
                    f"[Joystick] {client_id} "
                    f"wheels={message.wheels or '-'} "
                    f"gimbal={message.gimbal or '-'}"
                )

                if manager.is_controller(client_id):
                    robot.apply_joystick(
                        message.wheels,
                        message.gimbal,
                    )

            elif message_type == "chat":
                message = ChatMessage(**data)
                await chat.handle_chat(client_id, message.text)


            elif message_type == "slamClick":

                message = SlamClickMessage(**data)

                print(

                    f"[SLAM Click] {client_id} "

                    f"x={message.x:.2f}, y={message.y:.2f}"

                )

                if manager.is_controller(client_id):
                    robot.teleport_to(message.x, message.y)

                await manager.send_personal_message(

                    client_id,

                    {

                        "type": "slamClickAck",

                        "x": message.x,

                        "y": message.y,

                    },

                )


            elif message_type == "cycleMode":
                print(f"[Mode] Cycle requested by {client_id}")
                await manager.cycle_mode()

            else:
                print(f"[WebSocket] Unknown message: {data}")

    except WebSocketDisconnect:
        await manager.disconnect(client_id)

    except Exception as error:
        print(f"[WebSocket] Unexpected error: {error}")
        await manager.disconnect(client_id)