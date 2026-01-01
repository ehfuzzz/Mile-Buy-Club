/**
 * API fetch wrapper with error handling
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:3001';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  status?: number;
  error?: {
    code: string;
    message: string;
    details?: unknown;
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

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();

    console.log('API response status:', response.status);
    console.log('API response body:', payload);

    if (!response.ok) {
      const body = (payload ?? {}) as { code?: string; errorCode?: string; message?: string; details?: unknown };
      return {
        success: false,
        status: response.status,
        error: {
          code: body.code || body.errorCode || `HTTP_${response.status}`,
          message: body.message || response.statusText,
          details: body.details,
        },
      };
    }

    return { success: true, status: response.status, data: payload as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('API fetch error:', error);
    return {
      success: false,
      status: undefined,
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
