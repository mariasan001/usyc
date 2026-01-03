// src/lib/api/api.config.ts
// ✅ Config central del cliente API (un solo origen de verdad)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://usyc.site';
