// src/modulos/alumnos/ui/AlumnoRow/AlumnoRow.tsx
'use client';

import s from './AlumnoRow.module.css';
import type { Alumno } from '../../types/alumno.types';

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
  const escolaridadNombre = alumno.escolaridadNombre ?? '—';
  const carreraNombre = alumno.carreraNombre ?? '—';

  const fechaIngreso = alumno.fechaIngreso ?? '—';
  const fechaTermino = alumno.fechaTermino ?? '—';

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
        data-label="Carrera"
        title={carreraNombre}
      >
        {carreraNombre}
      </div>

      <div
        className={`${s.cellMono} ${s.oneLine}`}
        data-label="Ingreso"
        title={fechaIngreso}
      >
        {fechaIngreso}
      </div>

      <div
        className={`${s.cellMono} ${s.oneLine}`}
        data-label="Término"
        title={String(fechaTermino)}
      >
        {fechaTermino}
      </div>

      <div className={s.cell} data-label="Estado">
        <span
          className={`${s.pill} ${
            alumno.activo ? s.pill_ACTIVO : s.pill_INACTIVO
          }`}
        >
          {estadoLabel(!!alumno.activo)}
        </span>
      </div>

      {/* ✅ rowActions para sticky acciones del TableCard */}
      <div className={`${s.actions} rowActions`}>
        <button className={s.btn} onClick={onOpen}>
          Ver
        </button>
      </div>
    </div>
  );
}
