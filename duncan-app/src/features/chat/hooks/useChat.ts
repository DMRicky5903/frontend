import { useCallback, useRef, useState } from "react";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  pending?: boolean;
};

const createId = () => crypto.randomUUID();

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const pendingRef = useRef(false);

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();

    if (!text || pendingRef.current) return;

    pendingRef.current = true;
    setIsSending(true);

    const assistantId = createId();

    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "user",
        content: text,
        createdAt: Date.now(),
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        pending: true,
      },
    ]);

    setInputValue("");

    try {
      const reply = await requestReply(text);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? { ...message, content: reply, pending: false }
            : message,
        ),
      );
    } finally {
      pendingRef.current = false;
      setIsSending(false);
    }
  }, [inputValue]);

  const clearChat = useCallback(() => {
    if (pendingRef.current) return;
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

async function requestReply(prompt: string) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return `You said: “${prompt}”. This is a temporary mock response.`;
}
