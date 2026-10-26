import { useEffect, useRef } from "react";
import { Empty, Typography } from "antd";
import { MessageOutlined } from "@ant-design/icons";

import type { ChatMessage } from "../../hooks/useChat";

import { MessageBubble } from "../message-bubble/MessageBubble";
import styles from "./MessageList.module.css";

const { Text } = Typography;

type MessageListProps = {
  messages: ChatMessage[];
};

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <Empty
          image={<MessageOutlined className={styles.emptyIcon} />}
          description={
            <Text type="secondary">
              Type a message to start chatting
            </Text>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
