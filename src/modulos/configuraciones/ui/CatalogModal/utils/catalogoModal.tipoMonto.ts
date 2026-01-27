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
 * - INSCRIPCION / INS / INSCR... -> CARRERA_INSCRIPCION
 * - MENSUALIDAD / MENS / MEN...   -> CARRERA_MENSUALIDAD
 * - otro -> MONTO_MANUAL
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
  const t = String(tipoMonto ?? '').trim().toUpperCase();

  if (t === 'CARRERA_INSCRIPCION' || t === 'CARRERA-INSCRIPCION') {
    return 'Carrera / Inscripción';
  }

  if (t === 'CARRERA_MENSUALIDAD' || t === 'CARRERA-MENSUALIDAD') {
    return 'Carrera / Mensualidad';
  }

  return 'Monto manual';
}

