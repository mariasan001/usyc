// src/lib/api/api.config.ts

function normalizeBaseUrl(v: string): string {
  return v.replace(/\/+$/, ''); // quita slash final
}

const DEFAULT_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://usyc.site'
    : 'http://localhost:8000';

// ✅ ENV manda; si no existe, cae al default por ambiente
export const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE
);
