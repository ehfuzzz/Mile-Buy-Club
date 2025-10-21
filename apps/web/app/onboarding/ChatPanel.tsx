"use client";

import { FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}

export function ChatPanel({ messages, onSend, disabled, loading }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || disabled) {
      return;
    }

    try {
      setSending(true);
      await onSend(input.trim());
      setInput("");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Travel Intake Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex max-h-72 flex-col gap-3 overflow-y-auto rounded-md border border-slate-200 p-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-lg px-3 py-2 text-sm ${
                message.role === "assistant"
                  ? "bg-slate-100 text-slate-800"
                  : "bg-amber-500 text-white self-end"
              }`}
            >
              {message.content}
            </div>
          ))}
          {messages.length === 0 ? (
            <div className="text-sm text-slate-500">Loading conversation…</div>
          ) : null}
        </div>
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your answer…"
            disabled={disabled || sending || loading}
          />
          <Button type="submit" disabled={disabled || sending || loading}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
