// src/modulos/alumnos/hooks/utils/nombre.ts

/** Normaliza texto para comparaciones (trim + lower). */
export function normalizarTexto(s?: string | null): string {
  return (s ?? '').trim().toLowerCase();
}

/**
 * Regla para evitar spamear API:
 * - Solo consultamos recibos previos si el nombre ya es “usable”.
 */
export function nombreMinimoParaBuscar(nombre: string): boolean {
  return (nombre ?? '').trim().length >= 6;
}
