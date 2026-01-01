"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, Bot, CheckCircle2, Loader2, RefreshCw, Send } from "lucide-react";
import type { OnboardingState, Rule } from "@mile/shared";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTelemetry } from "@/lib/telemetry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string;
};

type SessionResponse = {
  sessionId: string;
  state: OnboardingState;
  missingFields: string[];
  rules: Rule[];
  assistantMessage?: string;
  questions?: string[];
  done?: boolean;
};

const SESSION_STORAGE_KEY = "mbc_onboarding_session_id";

export default function OnboardingChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<OnboardingState>({});
  const [rules, setRules] = useState<Rule[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llamaError, setLlamaError] = useState<string | null>(null);
  const [pendingRetryMessage, setPendingRetryMessage] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const hasStartedRef = useRef(false);
  const { trackEvent } = useTelemetry();

  const appendMessage = useCallback((message: Omit<ChatMessage, "id" | "ts">) => {
    setMessages((prev) => [
      ...prev,
      { ...message, id: `${message.role}-${Date.now()}-${prev.length}`, ts: new Date().toISOString() },
    ]);
  }, []);

  const scrollToBottom = useCallback(() => {
    const container = listRef.current;
    if (!container) return;
    const behavior = prefersReducedMotion ? "auto" : "smooth";
    if (typeof container.scrollTo === "function") {
      container.scrollTo({ top: container.scrollHeight, behavior });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    const mq = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (mq) {
      setPrefersReducedMotion(mq.matches);
      const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const rememberSession = useCallback((id: string) => {
    setSessionId(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_STORAGE_KEY, id);
    }
  }, []);

  const applyServerState = useCallback(
    (payload: SessionResponse, appendAssistant = false) => {
      rememberSession(payload.sessionId);
      setState(payload.state ?? {});
      setRules(payload.rules ?? []);
      setMissingFields(payload.missingFields ?? []);
      if (appendAssistant && payload.assistantMessage) {
        appendMessage({ role: "assistant", content: payload.assistantMessage });
      }
    },
    [appendMessage, rememberSession],
  );

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    let active = true;
    const startSession = async () => {
      setInitializing(true);
      setError(null);
      const cached = typeof window !== "undefined" ? window.localStorage.getItem(SESSION_STORAGE_KEY) : null;
      const payload = cached ? { sessionId: cached } : {};
      const response = await api.post<SessionResponse>("/onboarding/chat/session", payload);

      if (!active) return;

      if (!response.success || !response.data) {
        if (cached && typeof window !== "undefined") {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }
        setError(response.error?.message ?? "Unable to start onboarding chat.");
        setInitializing(false);
        await trackEvent({
          name: "onboarding_chat_view",
          timestamp: new Date().toISOString(),
          props: { missingFieldsCount: 0, ruleCount: 0 },
        });
        return;
      }

      applyServerState(response.data);
      setInitializing(false);
      await trackEvent({
        name: "onboarding_chat_view",
        timestamp: new Date().toISOString(),
        props: {
          missingFieldsCount: response.data.missingFields?.length ?? 0,
          ruleCount: response.data.rules?.length ?? 0,
        },
      });
    };

    startSession().catch((cause) => {
      setError(cause instanceof Error ? cause.message : "Unable to start onboarding chat.");
      setInitializing(false);
    });

    return () => {
      active = false;
    };
  }, [applyServerState, trackEvent]);

  const handleSend = useCallback(
    async (content?: string, appendUserMessage = true) => {
      if (!sessionId) return;
      const body = (content ?? input).trim();
      if (!body) return;
      setError(null);
      setLlamaError(null);
      setSending(true);
      setPendingRetryMessage(body);

      if (appendUserMessage) {
        appendMessage({ role: "user", content: body });
      }

      await trackEvent({
        name: "onboarding_chat_message_sent",
        timestamp: new Date().toISOString(),
        props: {
          missingFieldsCount: missingFields.length,
          ruleCount: rules.length,
        },
      });

      const response = await api.post<SessionResponse>("/onboarding/chat/message", { sessionId, message: body });
      setSending(false);

      if (!response.success || !response.data) {
        if (response.status === 503 && response.error?.code === "LLM_UNREACHABLE") {
          setLlamaError(response.error.message || "Local AI not running");
          return;
        }
        setError(response.error?.message ?? "Unable to send your message. Try again.");
        return;
      }

      const payload = response.data;
      applyServerState(payload, Boolean(payload.assistantMessage));
      setPendingRetryMessage(null);
      setInput("");

      await trackEvent({
        name: "onboarding_chat_message_received",
        timestamp: new Date().toISOString(),
        props: {
          missingFieldsCount: payload.missingFields?.length ?? 0,
          ruleCount: payload.rules?.length ?? 0,
        },
      });

      if (payload.done || (payload.missingFields ?? []).length === 0) {
        await trackEvent({
          name: "onboarding_completed",
          timestamp: new Date().toISOString(),
          props: {
            missingFieldsCount: payload.missingFields?.length ?? 0,
            ruleCount: payload.rules?.length ?? 0,
          },
        });
      }
    },
    [applyServerState, appendMessage, input, missingFields.length, rules.length, sessionId, trackEvent],
  );

  const formatRuleValue = (value: unknown) => {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object" && value !== null) return JSON.stringify(value);
    return String(value);
  };

  const constraintsPairs = useMemo(() => {
    return Object.entries(state || {});
  }, [state]);

  const renderMissingFields = missingFields.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {missingFields.map((field) => (
        <Badge key={field} variant="outline" className="bg-[rgba(122,166,255,0.08)] text-[color:var(--text)]">
          {field}
        </Badge>
      ))}
    </div>
  ) : (
    <div className="flex items-center gap-2 text-sm text-emerald-200">
      <CheckCircle2 className="h-4 w-4" />
      <span>All required details captured.</span>
    </div>
  );

  if (initializing) {
    return (
      <main className="container py-12">
        <div className="flex items-center gap-3 text-[color:var(--muted)]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Starting onboarding chat…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-10">
      <div className="mb-8 flex flex-col gap-3">
        <div className="flex items-center gap-3 text-[color:var(--muted)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(122,166,255,0.12)] text-[color:var(--accent)]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">Onboarding</p>
            <h1 className="text-3xl font-semibold text-[color:var(--text)]">Chat-assisted setup</h1>
          </div>
        </div>
        <p className="max-w-3xl text-[color:var(--muted)]">
          Tell us about your travel constraints. We never guess—every constraint, missing field, and rule below comes
          straight from the API.
        </p>
        <div className="flex items-center gap-3 text-xs text-[color:var(--muted)]">
          <Badge className="bg-[rgba(66,232,201,0.15)] text-[color:var(--text)]">Session</Badge>
          <span className="truncate text-[color:var(--muted)]">{sessionId}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-[rgba(122,166,255,0.25)] bg-[rgba(11,22,48,0.6)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg text-[color:var(--text)]">Conversation</CardTitle>
              <p className="text-sm text-[color:var(--muted)]">Share routes, cabins, and budgets; AI keeps state synced.</p>
            </div>
            {sending ? <Loader2 className="h-5 w-5 animate-spin text-[color:var(--muted)]" /> : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {llamaError ? (
              <Alert variant="destructive" className="border-amber-400/50 bg-[rgba(255,180,82,0.08)] text-amber-100">
                <AlertTitle className="flex items-center gap-2 text-amber-50">
                  <AlertTriangle className="h-4 w-4" />
                  Local AI not running
                </AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>
                    We couldn&apos;t reach your local llama.cpp server. Start it locally, then retry to keep onboarding
                    moving.
                  </p>
                  <pre className="overflow-auto rounded-md bg-[rgba(0,0,0,0.35)] p-3 text-xs text-amber-50">
                    ./llama-server -m /path/to/qwen2.5-7b-instruct.gguf -ngl 99 -c 8192 --host 127.0.0.1 --port 8080
                  </pre>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleSend(pendingRetryMessage ?? input, false)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="https://github.com/ggerganov/llama.cpp/tree/master/examples/server" target="_blank">
                        Setup guide
                      </Link>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : null}

            <div
              ref={listRef}
              className="flex max-h-[520px] min-h-[280px] flex-col gap-3 overflow-y-auto rounded-2xl border border-[rgba(122,166,255,0.2)] bg-[rgba(255,255,255,0.02)] p-4"
            >
              {messages.length === 0 ? (
                <div className="flex items-center gap-3 text-sm text-[color:var(--muted)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Waiting for your first message…</span>
                </div>
              ) : null}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex max-w-[85%] flex-col gap-1 rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    message.role === "assistant"
                      ? "bg-[rgba(122,166,255,0.08)] text-[color:var(--text)]"
                      : "ml-auto bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-[#031325]",
                    prefersReducedMotion ? "" : "chat-fade-in",
                  )}
                >
                  <span className="text-xs uppercase tracking-wide text-[rgba(255,255,255,0.65)]">
                    {message.role === "assistant" ? "Assistant" : "You"}
                  </span>
                  <p>{message.content}</p>
                </div>
              ))}
              {sending ? (
                <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Assistant is thinking…</span>
                </div>
              ) : null}
            </div>

            <form
              className="flex flex-col gap-3 rounded-2xl border border-[rgba(122,166,255,0.2)] bg-[rgba(255,255,255,0.02)] p-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                handleSend().catch(() => undefined);
              }}
            >
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Share routes, cabins, timing, budgets…"
                className="flex-1 border-[rgba(122,166,255,0.25)] bg-[rgba(7,13,31,0.65)] text-[color:var(--text)]"
                disabled={sending}
              />
              <Button type="submit" disabled={sending} className="gap-2">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-[rgba(122,166,255,0.25)] bg-[rgba(11,22,48,0.6)]">
            <CardHeader>
              <CardTitle className="text-[color:var(--text)]">Captured constraints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--muted)]">
              {constraintsPairs.length === 0 ? (
                <p>No constraints captured yet.</p>
              ) : (
                <div className="space-y-2">
                  {constraintsPairs.map(([key, value]) => (
                    <div key={key} className="flex flex-col rounded-xl bg-[rgba(255,255,255,0.02)] p-3">
                      <span className="text-xs uppercase tracking-wide text-[rgba(255,255,255,0.65)]">{key}</span>
                      <span className="text-[color:var(--text)]">
                        {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[rgba(122,166,255,0.25)] bg-[rgba(11,22,48,0.6)]">
            <CardHeader>
              <CardTitle className="text-[color:var(--text)]">Rules preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rules.length === 0 ? (
                <p className="text-sm text-[color:var(--muted)]">Rules will appear once constraints are captured.</p>
              ) : (
                <div className="space-y-2">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="rounded-xl border border-[rgba(122,166,255,0.25)] bg-[rgba(255,255,255,0.02)] p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[color:var(--text)] font-semibold capitalize">{rule.field}</span>
                        <Badge variant={rule.required ? "default" : "outline"}>
                          {rule.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[color:var(--muted)]">
                        {rule.op} → {formatRuleValue(rule.value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[rgba(122,166,255,0.25)] bg-[rgba(11,22,48,0.6)]">
            <CardHeader>
              <CardTitle className="text-[color:var(--text)]">Missing info</CardTitle>
            </CardHeader>
            <CardContent>{renderMissingFields}</CardContent>
          </Card>

          <Card className="border-[rgba(122,166,255,0.25)] bg-[rgba(11,22,48,0.6)]">
            <CardContent className="flex items-start gap-3 text-sm text-[color:var(--muted)]">
              <AlertCircle className="mt-0.5 h-4 w-4 text-[color:var(--accent)]" />
              <div className="space-y-2">
                <p>Need more control? Switch back to manual onboarding.</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/onboarding">Use guided form</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        .chat-fade-in {
          animation: chatFadeIn 200ms ease;
        }

        @keyframes chatFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chat-fade-in {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
