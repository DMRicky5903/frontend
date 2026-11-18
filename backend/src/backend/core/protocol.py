from typing import Literal, Union

from pydantic import BaseModel


RobotMode = Literal[0, 1, 2]
WheelDirection = Literal["W", "A", "S", "D", ""]
GimbalDirection = Literal["I", "J", "K", "L", ""]


class JoystickMessage(BaseModel):
    type: Literal["joystick"]
    wheels: WheelDirection
    gimbal: GimbalDirection


class ChatMessage(BaseModel):
    type: Literal["chat"]
    text: str


class SlamClickMessage(BaseModel):
    type: Literal["slamClick"]
    x: float
    y: float


class PingMessage(BaseModel):
    type: Literal["ping"]


class CycleModeMessage(BaseModel):
    type: Literal["cycleMode"]


ClientMessage = Union[
    JoystickMessage,
    ChatMessage,
    SlamClickMessage,
    PingMessage,
    CycleModeMessage,
]


class ClientIdentityMessage(BaseModel):
    type: Literal["clientIdentity"] = "clientIdentity"
    clientId: str


class ChatResponseMessage(BaseModel):
    type: Literal["chat"] = "chat"
    content: str


class ControlStateMessage(BaseModel):
    type: Literal["controlState"] = "controlState"
    controllerClientId: str | None


class ModeMessage(BaseModel):
    type: Literal["mode"] = "mode"
    mode: RobotMode


class MapOrigin(BaseModel):
    x: float
    y: float


class SlamMapMessage(BaseModel):
    type: Literal["slamMap"] = "slamMap"
    image: str
    resolution: float
    origin: MapOrigin


class SlamPoseMessage(BaseModel):
    type: Literal["slamPose"] = "slamPose"
    x: float
    y: float
    yaw: float


class SlamClickAckMessage(BaseModel):
    type: Literal["slamClickAck"] = "slamClickAck"
    x: float
    y: float


class PongMessage(BaseModel):
    type: Literal["pong"] = "pong"