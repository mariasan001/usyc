import { ApiError } from './api.errors';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  // Si luego ocupas auth:
  token?: string | null;
};

function joinUrl(base: string, path: string) {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${base}${path}`;
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = joinUrl(BASE, path);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers ?? {}),
  };

  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    cache: 'no-store',
  });

  if (!res.ok) {
    const payload = await parseJsonSafe(res);
    const msg =
      payload?.detail ||
      payload?.message ||
      `Error HTTP ${res.status} en ${path}`;
    throw new ApiError({ status: res.status, url, message: msg, payload });
  }

  // 204 no content
  if (res.status === 204) return undefined as T;

  const data = (await parseJsonSafe(res)) as T;
  return data;
}
