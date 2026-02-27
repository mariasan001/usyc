// src/lib/api/api.client.ts
// ✅ Cliente HTTP centralizado (fetch wrapper)
// ✅ Cookie-based auth: credentials: 'include'
// ✅ Parse JSON seguro (si no es JSON, cae a { raw: string })
// ✅ Lanza ApiError tipado
// ✅ Sin `any`
// ✅ Fix: mostrar mensaje raw del backend en errores
// ✅ Fix: no forzar Content-Type si NO hay body

import { ApiError, type ApiErrorPayload } from './api.errors';
import { API_BASE_URL } from './api.config';

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

/**
 * Lee la respuesta como texto.
 * - Si viene JSON válido -> parsea a objeto
 * - Si NO es JSON -> regresa { raw: "texto..." }
 *
 * Esto es clave porque muchos backends devuelven texto plano en 500.
 */
async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

/**
 * Normaliza el payload de error a un objeto seguro.
 * - Mantiene campos dinámicos del backend (sin any)
 * - Soporta { detail }, { message } o { raw }
 */
function toApiErrorPayload(v: unknown): ApiErrorPayload | undefined {
  if (!isObject(v)) return undefined;

  const out: ApiErrorPayload = {};
  for (const [k, val] of Object.entries(v)) out[k] = val;

  const detail = v.detail;
  const message = v.message;
  const raw = v.raw;

  if (typeof detail === 'string') out.detail = detail;
  if (typeof message === 'string') out.message = message;

  // ✅ muy importante: texto plano del backend (500, HTML, etc.)
  if (typeof raw === 'string') out.raw = raw;

  return out;
}

/**
 * ✅ Fix importante:
 * Si el backend manda texto plano (payload.raw),
 * lo mostramos en lugar del genérico "HTTP 500".
 */
function pickErrorMessage(payload: ApiErrorPayload | undefined, status: number, path: string) {
  if (payload?.detail) return payload.detail;
  if (payload?.message) return payload.message;

  const raw = payload?.raw;
  if (typeof raw === 'string' && raw.trim()) return raw;

  return `Error HTTP ${status} en ${path}`;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = joinUrl(API_BASE_URL, path);

  /**
   * ✅ No forzar Content-Type en requests sin body (GET, etc.)
   * Solo lo agregamos si hay body y no viene ya definido.
   */
  const headers: Record<string, string> = {
    ...(opts.headers ?? {}),
  };

  const hasBody = opts.body !== undefined;

  if (hasBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: hasBody ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    cache: 'no-store',
    credentials: 'include', // ✅ cookies auth
  });

  if (!res.ok) {
    const raw = await parseJsonSafe(res);
    const payload = toApiErrorPayload(raw);
    const message = pickErrorMessage(payload, res.status, path);

    // ✅ Este ApiError ya trae:
    // - status
    // - url
    // - message (incluye raw si aplica)
    // - payload (detail/message/raw + extras)
    throw new ApiError({ status: res.status, url, message, payload });
  }

  if (res.status === 204) return undefined as T;

  return (await parseJsonSafe(res)) as T;
}