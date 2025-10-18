/**
 * Analytics utilities and helpers
 */

export interface AnalyticsEvent {
  type: 'deal_viewed' | 'deal_booked' | 'deal_saved' | 'flight_searched';
  program?: string;
  value?: number;
  timestamp: Date;
}

/**
 * Track analytics event
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        timestamp: event.timestamp.toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Get user analytics summary
 */
export async function getAnalyticsSummary(): Promise<any> {
  try {
    const response = await fetch('/api/analytics/summary');
    return response.json();
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return null;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Calculate deal value (cents per point)
 */
export function calculateCPP(cashValue: number, points: number): number {
  if (points === 0) return 0;
  return (cashValue * 100) / points / 100;
}
