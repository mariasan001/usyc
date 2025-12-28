// src/lib/api/api.client.ts
// ✅ Cliente HTTP centralizado (fetch wrapper)
// ✅ Cookie-based auth: credentials: 'include'
// ✅ Parse JSON seguro
// ✅ Lanza ApiError tipado
// ✅ Sin `any`

import { ApiError, type ApiErrorPayload } from './api.errors';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

function joinUrl(base: string, path: string) {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${base}${path}`;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

function toApiErrorPayload(v: unknown): ApiErrorPayload | undefined {
  if (!isObject(v)) return undefined;

  const out: ApiErrorPayload = {};
  for (const [k, val] of Object.entries(v)) out[k] = val;

  const detail = v.detail;
  const message = v.message;

  if (typeof detail === 'string') out.detail = detail;
  if (typeof message === 'string') out.message = message;

  return out;
}

function pickErrorMessage(payload: ApiErrorPayload | undefined, status: number, path: string) {
  return payload?.detail || payload?.message || `Error HTTP ${status} en ${path}`;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = joinUrl(BASE, path);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers ?? {}),
  };

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    cache: 'no-store',

    // ✅ CLAVE: cookies (login/me/logout)
    credentials: 'include',
  });

  if (!res.ok) {
    const raw = await parseJsonSafe(res);
    const payload = toApiErrorPayload(raw);
    const message = pickErrorMessage(payload, res.status, path);
    throw new ApiError({ status: res.status, url, message, payload });
  }

  if (res.status === 204) return undefined as T;

  return (await parseJsonSafe(res)) as T;
}
