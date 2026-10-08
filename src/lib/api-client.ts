import { auth } from '@/lib/firebase/config';

export class ApiClientError extends Error {
  constructor(message: string, public status: number, public data: any) {
    super(message);
  }
}

// Calls one of our own API routes with the signed-in user's Firebase ID token.
export async function apiFetch<T = any>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(path, {
    method: init.method ?? 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiClientError(data.error ?? 'Something went wrong. Please try again.', res.status, data);
  return data as T;
}
