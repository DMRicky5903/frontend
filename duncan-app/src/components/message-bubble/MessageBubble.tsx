import { Spin, Typography } from "antd";
import { RobotOutlined, UserOutlined } from "@ant-design/icons";

import type { ChatMessage } from "../../hooks/useChat";

import styles from "./MessageBubble.module.css";

const { Text } = Typography;

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`${styles.row} ${
        isUser ? styles.userRow : styles.assistantRow
      }`}
    >
      <div className={styles.avatar}>
        {isUser ? <UserOutlined /> : <RobotOutlined />}
      </div>

      <div
        className={`${styles.bubble} ${
          isUser ? styles.userBubble : styles.assistantBubble
        }`}
      >
        {message.pending ? (
          <div className={styles.pending}>
            <Spin size="small" />
            <Text type="secondary">Thinking…</Text>
          </div>
        ) : (
          <Text className={styles.content}>{message.content}</Text>
        )}
      </div>
    </div>
  );
}
