import { Button, Typography } from "antd";
import { ClearOutlined } from "@ant-design/icons";

import { useChat } from "../../features/chat/hooks/useChat";
import { useControlPermission } from "../../api/useControlPermission";
import { ChatInput } from "../../features/chat/components/chat-input/ChatInput";
import { MessageList } from "../../features/chat/components/message-list/MessageList";

import styles from "./ChatPage.module.css";

const { Title } = Typography;

export function ChatPage() {
  const { canSend } = useControlPermission(0);

  const {
    messages,
    inputValue,
    isSending,
    setInputValue,
    sendMessage,
    clearChat,
  } = useChat({ canSend });

  return (
    <>
      <div className={styles.background}>
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className={styles.bubble}
            style={{
              left: `${4 + i * 7}%`,
              width: `${8 + (i % 5) * 6}px`,
              height: `${8 + (i % 5) * 6}px`,
              animationDuration: `${14 + (i % 5) * 5}s`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.page}>
        <header className={styles.header}>
          <Title level={5} className={styles.title}>
            Chat
          </Title>

          <Button
            className={styles.clearButton}
            icon={<ClearOutlined />}
            onClick={clearChat}
            disabled={isSending || messages.length === 0}
          >
            Clear
          </Button>
        </header>

        <main className={styles.chatPanel}>
          <MessageList messages={messages} />
        </main>

        <footer className={styles.footer}>
          <ChatInput
            value={inputValue}
            isSending={isSending}
            onChange={setInputValue}
            onSend={sendMessage}
          />
        </footer>
      </div>
    </>
  );
}
