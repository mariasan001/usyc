
// src/modulos/alumnos/hooks/utils/extraerCampo.ts

/**
 * Helpers para leer campos opcionales de objetos tipados
 * sin usar `any`.
 */

export function leerStringOpcional(obj: unknown, key: string): string {
  if (!obj || typeof obj !== 'object') return '';
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  return typeof v === 'string' ? v : '';
}

export function leerNumeroOpcional(obj: unknown, key: string): number {
  if (!obj || typeof obj !== 'object') return 0;
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}
