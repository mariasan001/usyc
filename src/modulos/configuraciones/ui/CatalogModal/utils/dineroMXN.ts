// src/modulos/configuraciones/ui/catalogo-modal/utils/dineroMXN.ts

/**
 * Convierte un number a string en formato MXN:
 * - 1200 => "1,200.00"
 */
export function formatearMXN(n: number): string {
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Convierte lo que escribe el usuario a number real.
 * - Limpia símbolos y letras
 * - Maneja coma como decimal si no hay punto
 * - Devuelve 0 si no es número
 */
export function parsearMXN(raw: string): number {
  let str = raw.trim();
  str = str.replace(/[^\d.,-]/g, '');

  const hasDot = str.includes('.');
  const hasComma = str.includes(',');

  if (hasComma && !hasDot) {
    str = str.replace(',', '.');
  } else {
    str = str.replace(/,/g, '');
  }

  if (!str || str === '-') return 0;

  const n = Number.parseFloat(str);
  return Number.isFinite(n) ? n : 0;
}
