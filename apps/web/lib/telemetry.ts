"use client";

import { useCallback, useMemo, useRef } from 'react';
import { z } from 'zod';

const TelemetryEventName = z.union([
  z.literal('landing_view'),
  z.literal('landing_scroll_depth'),
  z.literal('cta_click'),
  z.literal('nav_click'),
  z.literal('demo_click'),
  z.literal('onboarding_chat_view'),
  z.literal('onboarding_chat_message_sent'),
  z.literal('onboarding_chat_message_received'),
  z.literal('onboarding_completed'),
]);

const allowedProps = z
  .object({
    location: z
      .enum(['hero', 'nav', 'final_cta'])
      .or(z.string().regex(/^section:[\w-]+$/))
      .optional(),
    cta: z.enum(['get_started', 'sign_in', 'browse_deals', 'watch_demo']).optional(),
    scrollDepth: z.union([z.literal(25), z.literal(50), z.literal(75), z.literal(90)]).optional(),
    missingFieldsCount: z.number().int().nonnegative().optional(),
    ruleCount: z.number().int().nonnegative().optional(),
  })
  .strict();

const TelemetryEventSchema = z.object({
  name: TelemetryEventName,
  timestamp: z.string().datetime(),
  props: allowedProps.optional(),
});

export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;
export type TelemetryEventName = TelemetryEvent['name'];

const TELEMETRY_ENDPOINT = '/api/analytics/events';

async function sendTelemetry(event: TelemetryEvent) {
  const parsed = TelemetryEventSchema.safeParse(event);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Telemetry validation failed', parsed.error.flatten());
    }
    return;
  }

  if (typeof fetch === 'undefined') {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Telemetry dispatch skipped: fetch unavailable');
    }
    return;
  }

  try {
    const response = await fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Telemetry dispatched', parsed.data, 'ok:', response.ok);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Telemetry dispatch failed', error);
    }
  }
}

export function useTelemetry() {
  const depthRef = useRef<{ [k in 25 | 50 | 75 | 90]?: boolean }>({});

  const trackEvent = useCallback(async (event: TelemetryEvent) => {
    await sendTelemetry(event);
  }, []);

  const hasTrackedDepth = useMemo(() => depthRef.current, []);

  return { trackEvent, hasTrackedDepth };
}
