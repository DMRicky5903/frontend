import { useCallback, useEffect, useRef, useState } from "react";

import {
  useWebSocketJson,
  useWebSocketSend,
} from "../../../api/useWebSocket";

import type { JsonServerMessage } from "../../../api/type";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  pending?: boolean;
  error?: string;
};

const createId = () => crypto.randomUUID();

const CHAT_RESPONSE_TIMEOUT_MS = 3000;

const CHAT_TIMEOUT_ERROR = "伺服器暫時無法回應，請稍後再試。";

const CHAT_LOCKED_ERROR = "目前不在服務端，無法回應。";

type UseChatOptions = {
  canSend?: boolean;
};

export function useChat({ canSend = true }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const pendingAssistantIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const send = useWebSocketSend();

  const clearChatTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const failPendingMessage = useCallback(
    (error: string) => {
      const assistantId = pendingAssistantIdRef.current;

      if (!assistantId) {
        return;
      }

      setMessages((prev) =>
        prev.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                pending: false,
                error,
              }
            : item,
        ),
      );

      pendingAssistantIdRef.current = null;
      setIsSending(false);
    },
    [],
  );

  const handleMessage = useCallback(
    (message: JsonServerMessage) => {
      if (message.type !== "chat") {
        return;
      }

      const assistantId = pendingAssistantIdRef.current;

      if (!assistantId) {
        return;
      }

      clearChatTimeout();

      setMessages((prev) =>
        prev.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content: message.content,
                pending: false,
              }
            : item,
        ),
      );

      pendingAssistantIdRef.current = null;
      setIsSending(false);
    },
    [clearChatTimeout],
  );

  useWebSocketJson(handleMessage);

  useEffect(() => {
    return () => {
      clearChatTimeout();
    };
  }, [clearChatTimeout]);

  const sendMessage = useCallback(() => {
    const text = inputValue.trim();

    if (!text || pendingAssistantIdRef.current) {
      return;
    }

    const userMessageId = createId();
    const assistantMessageId = createId();

    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content: text,
        createdAt: Date.now(),
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        pending: true,
      },
    ]);

    setInputValue("");

    if (!canSend) {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === assistantMessageId
            ? {
                ...item,
                pending: false,
                error: CHAT_LOCKED_ERROR,
              }
            : item,
        ),
      );

      return;
    }

    const sent = send({
      type: "chat",
      text,
    });

    if (!sent) {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === assistantMessageId
            ? {
                ...item,
                pending: false,
                error: CHAT_LOCKED_ERROR,
              }
            : item,
        ),
      );

      return;
    }

    pendingAssistantIdRef.current = assistantMessageId;
    setIsSending(true);

    clearChatTimeout();

    timeoutRef.current = window.setTimeout(() => {
      failPendingMessage(CHAT_TIMEOUT_ERROR);
      timeoutRef.current = null;
    }, CHAT_RESPONSE_TIMEOUT_MS);
  }, [
    inputValue,
    canSend,
    send,
    clearChatTimeout,
    failPendingMessage,
  ]);

  const clearChat = useCallback(() => {
    if (pendingAssistantIdRef.current) {
      return;
    }

    setMessages([]);
  }, []);

  return {
    messages,
    inputValue,
    isSending,
    setInputValue,
    sendMessage,
    clearChat,
  };
}
