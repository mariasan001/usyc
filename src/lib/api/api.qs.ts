// src/lib/api/api.qs.ts
// ✅ Helper para construir querystrings sin mandar null/undefined/""
export function qs(params?: Record<string, unknown>) {
  const sp = new URLSearchParams();
  if (!params) return '';

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;

    if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)));
    else sp.set(k, String(v));
  });

  const q = sp.toString();
  return q ? `?${q}` : '';
}
