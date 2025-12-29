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
 * Suma meses a una fecha ISO (YYYY-MM-DD).
 * - Corrige “desbordes” de día (ej: 31 + 1 mes → último día del mes siguiente).
 */
export function sumarMesesISO(iso: string, meses: number): string {
  const [y, m, d] = iso.split('-').map(Number);

  const base = new Date(y, m - 1 + meses, d);
  const diasEnMesObjetivo = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

  const segura = new Date(
    base.getFullYear(),
    base.getMonth(),
    Math.min(d, diasEnMesObjetivo),
  );

  return `${segura.getFullYear()}-${pad2(segura.getMonth() + 1)}-${pad2(segura.getDate())}`;
}
