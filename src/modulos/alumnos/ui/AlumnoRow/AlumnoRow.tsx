// src/modulos/alumnos/ui/AlumnoRow/AlumnoRow.tsx
'use client';

import s from './AlumnoRow.module.css';

import type { Alumno } from '../../types/alumno.types';
import { useCarreras } from '@/modulos/configuraciones/hooks';
import { calcularFechaTermino } from './utils/calcularTermino';

function estadoLabel(activo: boolean) {
  return activo ? 'Activo' : 'Inactivo';
}

export default function AlumnoRow({
  alumno,
  onOpen,
}: {
  alumno: Alumno;
  onOpen: () => void;
}) {
  const carrerasApi = useCarreras({ soloActivos: true });

  const escolaridadNombre = alumno.escolaridadNombre ?? '—';
  const programaNombre = alumno.carreraNombre ?? '—';

  // ✅ ajusta el campo si tu backend lo llama distinto
  const plantelNombre = (alumno as unknown as { plantelNombre?: string }).plantelNombre ?? '—';

  const fechaIngreso = alumno.fechaIngreso ?? null;

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

      <div className={`${s.cell} ${s.oneLine}`} data-label="Escolaridad" title={escolaridadNombre}>
        {escolaridadNombre}
      </div>

      <div className={`${s.cell} ${s.twoLines}`} data-label="Programa" title={programaNombre}>
        {programaNombre}
      </div>

      <div className={`${s.cell} ${s.oneLine}`} data-label="Plantel" title={plantelNombre}>
        {plantelNombre}
      </div>

      <div className={`${s.cellMono} ${s.oneLine}`} data-label="Ingreso" title={fechaIngreso ?? '—'}>
        {fechaIngreso ?? '—'}
      </div>

      <div className={`${s.cellMono} ${s.oneLine}`} data-label="Término" title={fechaTermino}>
        {fechaTermino}
      </div>

      <div className={s.cell} data-label="Estado">
        <span className={`${s.pill} ${alumno.activo ? s.pill_ACTIVO : s.pill_INACTIVO}`}>
          {estadoLabel(Boolean(alumno.activo))}
        </span>
      </div>

      <div className={`${s.actions} rowActions`}>
        <button className={s.btn} onClick={onOpen} type="button">
          Ver
        </button>
      </div>
    </div>
  );
}
