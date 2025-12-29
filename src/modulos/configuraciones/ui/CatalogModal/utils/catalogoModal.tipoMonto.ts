// src/modulos/configuraciones/ui/catalogo-modal/utils/catalogoModal.tipoMonto.ts

/**
 * Normaliza texto para comparaciones:
 * - trim
 * - mayúsculas
 * - sin acentos
 * - sin caracteres raros (deja letras/números/espacios/guiones)
 */
function normalizarClave(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^A-Z0-9\s-]/g, ''); // limpia símbolos
}

/**
 * Decide tipoMonto por CÓDIGO o NOMBRE.
 * - INSCRIPCION / INS / INSCR... -> CARRERA-INSCRIPCION
 * - MENSUALIDAD / MENS / MEN...   -> CARRERA-MENSUALIDAD
 * - otro -> MONTO-MANUAL
 */
export function calcularTipoMontoConcepto(args: {
  codigo?: unknown;
  nombre?: unknown;
}): string {
  const c = normalizarClave(args.codigo);
  const n = normalizarClave(args.nombre);

  // Helpers de detección por "se parece a"
  const esInscripcion =
    c === 'INSCRIPCION' ||
    c.startsWith('INS') ||
    n === 'INSCRIPCION' ||
    n.startsWith('INSCRIPCION') ||
    n.startsWith('INS');

  const esMensualidad =
    c === 'MENSUALIDAD' ||
    c.startsWith('MENS') ||
    c.startsWith('MEN') ||
    n === 'MENSUALIDAD' ||
    n.startsWith('MENSUALIDAD') ||
    n.startsWith('MENS') ||
    n.startsWith('MEN');

  if (esInscripcion) return 'CARRERA_INSCRIPCION';
  if (esMensualidad) return 'CARRERA_MENSUALIDAD';
  return 'MONTO_MANUAL';
}

/**
 * Etiqueta bonita para UI (no afecta payload).
 */
export function etiquetarTipoMonto(tipoMonto: string): string {
  if (tipoMonto === 'CARRERA-INSCRIPCION') return 'Carrera_Inscripción';
  if (tipoMonto === 'CARRERA-MENSUALIDAD') return 'Carrera_Mensualidad';
  return 'Monto_manual';
}
