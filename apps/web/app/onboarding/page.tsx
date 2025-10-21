"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { ChatPanel, ChatMessage } from "./ChatPanel";
import { SummaryChips, SummaryProfile } from "./SummaryChips";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const QUESTIONS = [
  "Great to meet you! Where do you typically depart from?",
  "Any dream destinations (or spots you want to avoid)?",
  "What cabin do you prefer and how many travelers are usually with you?",
  "What's your points or cash budget for flights?",
  "Any loyalty programs or cards we should know about?",
];

const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-user";

interface ApiProfile {
  userId: string;
  maxPoints: number | null;
  maxCashUsd: number | null;
  minCppCents: number | null;
  homeBases: Array<{ location: { iata: string | null; name: string } }>;
  airlinesPref: Array<{ mode: "PREFER" | "AVOID"; airline: { code2: string } }>;
}

export default function OnboardingPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [summarySaving, setSummarySaving] = useState(false);

  const loadProfile = useCallback(async () => {
    const response = await api.get<ApiProfile>(`/profile?userId=${DEMO_USER_ID}`);
    if (response.success && response.data) {
      setProfile(response.data);
    }
  }, []);

  useEffect(() => {
    loadProfile().catch(() => undefined);
  }, [loadProfile]);

  useEffect(() => {
    async function startSession() {
      const response = await api.post<{ id: string }>("/onboarding/session", {
        userId: DEMO_USER_ID,
      });
      if (response.success && response.data) {
        setSessionId(response.data.id);
      } else if (!response.success) {
        setError(response.error?.message ?? "Unable to start onboarding session.");
      }
    }

    startSession().catch((cause) => {
      setError(cause instanceof Error ? cause.message : "Unable to start onboarding session.");
    });
  }, []);

  useEffect(() => {
    if (sessionId && messages.length === 0) {
      sendAssistantMessage(QUESTIONS[0]).catch((cause) => {
        setError(cause instanceof Error ? cause.message : "Unable to start chat.");
      });
    }
  }, [sessionId, messages.length]);

  const sendAssistantMessage = useCallback(
    async (content: string) => {
      if (!sessionId) return;
      setMessages((prev) => [...prev, { role: "assistant", content }]);
      const response = await api.post("/onboarding/message", {
        sessionId,
        role: "assistant",
        content,
      });
      if (!response.success) {
        throw new Error(response.error?.message ?? "Failed to send assistant message.");
      }
    },
    [sessionId],
  );

  const fetchProfile = useCallback(async () => {
    const response = await api.get<ApiProfile>(`/profile?userId=${DEMO_USER_ID}`);
    if (response.success && response.data) {
      setProfile(response.data);
    } else if (!response.success) {
      throw new Error(response.error?.message ?? "Failed to load profile.");
    }
  }, []);

  const runExtraction = useCallback(
    async (activeSessionId: string) => {
      const response = await api.post(`/onboarding/extract`, {
        sessionId: activeSessionId,
        userId: DEMO_USER_ID,
      });
      if (!response.success) {
        throw new Error(response.error?.message ?? "Failed to extract profile.");
      }
      await fetchProfile();
    },
    [fetchProfile],
  );

  const handleSend = useCallback(
    async (content: string) => {
      if (!sessionId) return;
      setError(null);
      setMessages((prev) => [...prev, { role: "user", content }]);
      const response = await api.post("/onboarding/message", {
        sessionId,
        role: "user",
        content,
      });
      if (!response.success) {
        setError(response.error?.message ?? "Unable to save your response.");
        return;
      }

      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      if (nextStep < QUESTIONS.length) {
        await sendAssistantMessage(QUESTIONS[nextStep]);
        return;
      }

      setLoading(true);
      try {
        await runExtraction(sessionId);
        await sendAssistantMessage("Thanks! I’ve captured your travel preferences.");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Profile extraction failed.");
      } finally {
        setLoading(false);
      }
    },
    [currentStep, runExtraction, sendAssistantMessage, sessionId],
  );

  const summaryProfile = useMemo<SummaryProfile | null>(() => {
    if (!profile) {
      return null;
    }

    return {
      userId: profile.userId,
      maxPoints: profile.maxPoints,
      maxCashUsd: profile.maxCashUsd,
      minCppCents: profile.minCppCents,
      homeBases: profile.homeBases.map((home) => ({
        code: home.location.iata ?? home.location.name,
      })),
      airlines: {
        prefer: profile.airlinesPref
          .filter((pref) => pref.mode === "PREFER")
          .map((pref) => pref.airline.code2),
        avoid: profile.airlinesPref
          .filter((pref) => pref.mode === "AVOID")
          .map((pref) => pref.airline.code2),
      },
    };
  }, [profile]);

  const handleSummarySave = useCallback(
    async (update: { homeBases: string[]; airlines: { prefer: string[]; avoid: string[] }; budget: { maxPoints: number | null; maxCashUsd: number | null; minCppCents: number | null } }) => {
      setSummarySaving(true);
      setError(null);
      try {
        const response = await api.patch(`/profile?userId=${DEMO_USER_ID}`, {
          homeBases: update.homeBases.map((code) => ({ kind: "CITY", code, name: code })),
          airlines: update.airlines,
          budget: update.budget,
        });
        if (!response.success) {
          throw new Error(response.error?.message ?? "Unable to save profile.");
        }
        await fetchProfile();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to save profile.");
      } finally {
        setSummarySaving(false);
      }
    },
    [fetchProfile],
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-8">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <ChatPanel
        messages={messages}
        onSend={handleSend}
        disabled={!sessionId || loading || currentStep >= QUESTIONS.length}
        loading={loading}
      />

      <Card>
        <CardContent className="py-6 text-sm text-slate-600">
          Answer a few quick questions so we can tailor flight alerts and recommendations to you.
        </CardContent>
      </Card>

      {summaryProfile ? (
        <SummaryChips profile={summaryProfile} onSave={handleSummarySave} saving={summarySaving} />
      ) : null}
    </div>
  );
}
