import { Button, Input, Tooltip } from "antd";
import { SendOutlined } from "@ant-design/icons";
import type { KeyboardEvent } from "react";

import styles from "./ChatInput.module.css";

const { TextArea } = Input;

type ChatInputProps = {
  value: string;
  isSending: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
};

export function ChatInput({
  value,
  isSending,
  onChange,
  onSend,
}: ChatInputProps) {
  const canSend = value.trim().length > 0 && !isSending;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className={styles.wrapper}>
      <TextArea
        className={styles.textArea}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        autoSize={{ minRows: 1, maxRows: 4 }}
        disabled={isSending}
      />

      <Tooltip title="Send">
        <Button
          className={styles.sendButton}
          type="primary"
          shape="circle"
          size="large"
          icon={<SendOutlined />}
          loading={isSending}
          disabled={!canSend}
          onClick={onSend}
        />
      </Tooltip>
    </div>
  );
}
