import { Button, Typography } from "antd";
import { ClearOutlined } from "@ant-design/icons";

import { useChat } from "../../hooks/useChat";
import { ChatInput } from "../../components/chat-input/ChatInput";
import { MessageList } from "../../components/message-list/MessageList";
import styles from "./ChatPage.module.css";

const { Text, Title } = Typography;

export function ChatPage() {
  const {
    messages,
    inputValue,
    isSending,
    setInputValue,
    sendMessage,
    clearChat,
  } = useChat();

  return (
    <>  
      <div className={styles.background} />
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <Title level={4} className={styles.title}>
              Chat
            </Title>

            <Text type="secondary" className={styles.subtitle}>
              Ask about the robot, manufacturing, or anything else.
            </Text>
          </div>

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
