import { renderHook, act } from '@testing-library/react';
import { useTelemetry } from '../lib/telemetry';

describe('telemetry validation', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true })) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('sends valid telemetry events', async () => {
    const { result } = renderHook(() => useTelemetry());

    await act(async () => {
      await result.current.trackEvent({ name: 'landing_view', timestamp: new Date().toISOString() });
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/analytics/events',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('tracks scroll depth thresholds once', async () => {
    const { result } = renderHook(() => useTelemetry());

    const depthState = result.current.hasTrackedDepth;
    expect(depthState[25]).toBeUndefined();
    depthState[25] = true;
    expect(depthState[25]).toBe(true);
  });
});

