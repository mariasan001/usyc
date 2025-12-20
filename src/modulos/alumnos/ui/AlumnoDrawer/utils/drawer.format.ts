export function safeNumber(v: unknown, fallback = 0) {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function formatMXN(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(x);
}
