// src/modulos/alumnos/ui/AlumnoRow/AlumnoRow.tsx
'use client';

import s from './AlumnoRow.module.css';

import type { Alumno } from '../../types/alumno.types';
import { useCarreras } from '@/modulos/configuraciones/hooks';
import { calcularFechaTermino } from './utils/calcularTermino';

function estadoLabel(activo: boolean) {
  return activo ? 'Activo' : 'Inactivo';
}

/**
 * Row del directorio.
 * - UI: muestra alumno y acción "Ver".
 * - Lógica mínima:
 *   - “Término” se calcula si el backend no lo manda, usando:
 *     fechaIngreso + duración de la carrera/programa (desde catálogo de carreras).
 *
 * Nota:
 * - Esto evita modificar backend y mantiene el card limpio.
 * - Si no hay carreraId o no se encuentra en catálogo → '—'.
 */
export default function AlumnoRow({
  alumno,
  onOpen,
}: {
  alumno: Alumno;
  onOpen: () => void;
}) {
  // Catálogo carreras (solo activos). Se usa para resolver duración por carreraId.
  const carrerasApi = useCarreras({ soloActivos: true });

  // Datos “seguros” para UI
  const escolaridadNombre = alumno.escolaridadNombre ?? '—';
  const programaNombre = alumno.carreraNombre ?? '—';

  const fechaIngreso = alumno.fechaIngreso ?? null;

  /**
   * Si el backend NO manda fechaTermino, la calculamos.
   * Para eso buscamos la carrera por `alumno.carreraId`.
   *
   * Importante:
   * - `carreraId` en tu sistema puede ser string.
   * - Aquí comparamos como string para que no truene por tipos.
   */
const carreraCatalogo = (carrerasApi.items ?? []).find(
  (c) => String(c.carreraId) === String(alumno.carreraId ?? ''),
);

  const fechaTermino =
    alumno.fechaTermino ??
    calcularFechaTermino(fechaIngreso, {
      duracionAnios: carreraCatalogo?.duracionAnios ?? null,
      duracionMeses: carreraCatalogo?.duracionMeses ?? null,
    });

  return (
    <div className={s.row}>
      <div className={s.cellMain}>
        <div className={`${s.name} ${s.oneLine}`} title={alumno.nombreCompleto}>
          {alumno.nombreCompleto}
        </div>
        <div className={`${s.matricula} ${s.oneLine}`} title={alumno.matricula}>
          {alumno.matricula}
        </div>
      </div>

      <div
        className={`${s.cell} ${s.oneLine}`}
        data-label="Escolaridad"
        title={escolaridadNombre}
      >
        {escolaridadNombre}
      </div>

      <div
        className={`${s.cell} ${s.twoLines}`}
        data-label="Programa"
        title={programaNombre}
      >
        {programaNombre}
      </div>

      <div
        className={`${s.cellMono} ${s.oneLine}`}
        data-label="Ingreso"
        title={fechaIngreso ?? '—'}
      >
        {fechaIngreso ?? '—'}
      </div>

      <div
        className={`${s.cellMono} ${s.oneLine}`}
        data-label="Término"
        title={fechaTermino}
      >
        {fechaTermino}
      </div>

      <div className={s.cell} data-label="Estado">
        <span
          className={`${s.pill} ${alumno.activo ? s.pill_ACTIVO : s.pill_INACTIVO}`}
        >
          {estadoLabel(Boolean(alumno.activo))}
        </span>
      </div>

      {/* ✅ rowActions para sticky acciones del TableCard */}
      <div className={`${s.actions} rowActions`}>
        <button className={s.btn} onClick={onOpen} type="button">
          Ver
        </button>
      </div>
    </div>
  );
}
