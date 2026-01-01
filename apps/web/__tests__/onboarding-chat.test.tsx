import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import OnboardingChatPage from '../app/onboarding/chat/page';

jest.mock('../lib/telemetry', () => ({
  useTelemetry: () => ({ trackEvent: jest.fn().mockResolvedValue(undefined) }),
}));

const jsonResponse = (data: unknown, status = 201, ok = true) =>
  Promise.resolve({
    ok,
    status,
    headers: {
      get: (key: string) => (key.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as unknown as Response);

describe('Onboarding chat page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.localStorage.clear();
  });

  it('renders chat UI and sends a message', async () => {
    const sessionPayload = {
      sessionId: 's-1',
      state: {},
      missingFields: ['homeAirports'],
      rules: [],
    };
    const messagePayload = {
      sessionId: 's-1',
      state: { homeAirports: ['JFK'] },
      missingFields: [],
      rules: [
        { id: 'rule_homeAirports', field: 'homeAirport', op: 'eq', value: 'JFK', required: true, source: 'user' },
      ],
      assistantMessage: 'Captured JFK as your home airport.',
      done: true,
    };

    global.fetch = jest.fn((url: string) => {
      if (url.includes('/onboarding/chat/message')) {
        return jsonResponse(messagePayload);
      }
      return jsonResponse(sessionPayload);
    }) as unknown as typeof fetch;

    render(<OnboardingChatPage />);

    expect(await screen.findByText(/Chat-assisted setup/i)).toBeInTheDocument();

    const input = await screen.findByPlaceholderText(/Share routes/i);
    fireEvent.change(input, { target: { value: 'My home airport is JFK' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/onboarding/chat/message'), expect.anything()),
    );
    expect(await screen.findByText(/Captured JFK/i)).toBeInTheDocument();
    expect(await screen.findByText(/homeAirports/i)).toBeInTheDocument();
    expect(await screen.findByText(/Rules preview/i)).toBeInTheDocument();
  });

  it('shows fail-closed UI when llama is unreachable', async () => {
    const sessionPayload = {
      sessionId: 's-1',
      state: {},
      missingFields: ['homeAirports'],
      rules: [],
    };

    global.fetch = jest.fn((url: string) => {
      if (url.includes('/onboarding/chat/message')) {
        return jsonResponse({ code: 'LLM_UNREACHABLE', message: 'Local AI not running' }, 503, false);
      }
      return jsonResponse(sessionPayload);
    }) as unknown as typeof fetch;

    render(<OnboardingChatPage />);

    const input = await screen.findByPlaceholderText(/Share routes/i);
    fireEvent.change(input, { target: { value: 'Testing offline' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    expect(await screen.findByText(/Local AI not running/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    expect(screen.getByText(/llama-server/i)).toBeInTheDocument();
  });
});
