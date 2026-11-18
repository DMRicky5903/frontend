import asyncio

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.websocket import manager, robot, router, slam
from backend.core.config import FRONTEND_ORIGIN, HOST, PORT
from backend.services.camera import CameraService

app = FastAPI(title="Robot Web Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

camera = CameraService(manager)


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "clients": len(manager.connections),
        "controllerClientId": manager.controller_client_id,
        "mode": manager.mode,
    }


async def listen_terminal_mode_cycle() -> None:
    print(
        "Press Enter in this terminal to cycle mode: "
        "0 -> 1 -> 2 -> 0"
    )

    loop = asyncio.get_running_loop()

    while True:
        # input() 是 blocking call，
        # 必須放到 executor，避免卡住 FastAPI 的 event loop。
        await loop.run_in_executor(None, input)

        await manager.cycle_mode()


@app.on_event("startup")
async def startup() -> None:
    slam.load_map()

    asyncio.create_task(robot.broadcast_pose_loop())
    asyncio.create_task(camera.stream_to_controller())
    asyncio.create_task(listen_terminal_mode_cycle())


def main() -> None:
    uvicorn.run(
        "backend.web_server:app",
        host=HOST,
        port=PORT,
        reload=True,
    )

if __name__ == "__main__":
    main()

