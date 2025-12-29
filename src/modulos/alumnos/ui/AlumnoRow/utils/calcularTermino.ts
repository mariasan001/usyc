// src/modulos/alumnos/ui/AlumnoRow/utils/calcularTermino.ts
import { sumarMesesISO } from '@/modulos/alumnos/hooks/utils/fechasISO';

type Duracion = {
  duracionAnios?: number | null;
  duracionMeses?: number | null;
};

/**
 * Calcula la fecha de término:
 *  término = fechaIngreso + (duracionAnios * 12 + duracionMeses)
 *
 * - Si falta fechaIngreso o duración → regresa '—'
 * - Usa sumarMesesISO para evitar errores con meses de diferente longitud.
 */
export function calcularFechaTermino(
  fechaIngreso?: string | null,
  dur?: Duracion | null,
): string {
  if (!fechaIngreso) return '—';

  const anios = Number(dur?.duracionAnios ?? 0);
  const meses = Number(dur?.duracionMeses ?? 0);

  const totalMeses =
    (Number.isFinite(anios) ? anios : 0) * 12 +
    (Number.isFinite(meses) ? meses : 0);

  if (!totalMeses) return '—';

  return sumarMesesISO(fechaIngreso, totalMeses);
}
