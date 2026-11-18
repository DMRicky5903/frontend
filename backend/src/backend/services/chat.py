from backend.core.config import CHAT_REPLY_PREFIX
from backend.core.connection_manager import ConnectionManager
from backend.core.protocol import ChatResponseMessage


class ChatService:
    def __init__(self, manager: ConnectionManager) -> None:
        self.manager = manager

    async def handle_chat(self, client_id: str, text: str) -> None:
        print(f"[Chat] {client_id}: {text}")

        if not self.manager.is_controller(client_id):
            print(f"[Chat] Rejected non-controller message from {client_id}")
            return

        reply = f"{CHAT_REPLY_PREFIX} {text}"

        await self.manager.send_personal_message(
            client_id,
            ChatResponseMessage(content=reply),
        )