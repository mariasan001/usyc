// src/modulos/alumnos/ui/AlumnoRow/AlumnoRow.tsx
'use client';

import s from './AlumnoRow.module.css';
import type { Alumno } from '../../types/alumnos.tipos';
import { getCarreraById, getEscolaridadById } from '../../constants/catalogos.constants';

function estadoLabel(e: Alumno['estado']) {
  if (e === 'ACTIVO') return 'Activo';
  if (e === 'POR_VENCER') return 'Por vencer';
  return 'Egresado';
}

export default function AlumnoRow({ alumno, onOpen }: { alumno: Alumno; onOpen: () => void }) {
  const esc = getEscolaridadById(alumno.escolaridadId);
  const car = getCarreraById(alumno.carreraId ?? null);

  return (
    <div className={s.row}>
      <div className={s.cellMain}>
        <div className={s.name} title={alumno.nombre}>{alumno.nombre}</div>
        <div className={s.matricula}>{alumno.matricula}</div>
      </div>

      <div className={s.cell} data-label="Escolaridad">{esc?.nombre ?? '—'}</div>
      <div className={s.cell} data-label="Carrera">{car?.nombre ?? '—'}</div>
      <div className={s.cellMono} data-label="Ingreso">{alumno.fechaIngreso}</div>
      <div className={s.cellMono} data-label="Término">{alumno.fechaTermino}</div>

      <div className={s.cell} data-label="Estado">
        <span className={`${s.pill} ${s[`pill_${alumno.estado}`]}`}>{estadoLabel(alumno.estado)}</span>
      </div>

      <div className={s.actions}>
        <button className={s.btn} onClick={onOpen}>Ver</button>
      </div>
    </div>
  );
}
