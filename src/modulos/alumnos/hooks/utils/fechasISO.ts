// src/modulos/alumnos/hooks/utils/fechasISO.ts

/**
 * Helpers de fechas ISO (YYYY-MM-DD) para el formulario.
 * - Sin librerías externas.
 * - Pensado para inputs type="date".
 */

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Devuelve hoy en formato ISO YYYY-MM-DD (hora local). */
export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Suma N meses a una fecha ISO (YYYY-MM-DD).
 * - Corrige meses con menos días (ej: 31 -> 30/28).
 */
export function sumarMesesISO(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const base = new Date(y, m - 1 + months, d);

  const daysInTargetMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const safe = new Date(base.getFullYear(), base.getMonth(), Math.min(d, daysInTargetMonth));

  return `${safe.getFullYear()}-${pad2(safe.getMonth() + 1)}-${pad2(safe.getDate())}`;
}