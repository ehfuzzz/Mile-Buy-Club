/**
 * API fetch wrapper with error handling
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API fetch URL:', url);
    console.log('API fetch options:', options);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('API response status:', response.status);
    console.log('API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('API fetch error:', error);
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message,
      },
    };
  }
}

export const api = {
  get: <T,>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'GET' }),
  
  post: <T,>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  
  put: <T,>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T,>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T,>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
};
