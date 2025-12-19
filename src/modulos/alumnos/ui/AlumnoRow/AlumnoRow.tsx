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

  const escolaridadNombre = esc?.nombre ?? '—';
  const carreraNombre = car?.nombre ?? '—';

  return (
    <div className={s.row}>
      <div className={s.cellMain}>
        <div className={`${s.name} ${s.oneLine}`} title={alumno.nombre}>
          {alumno.nombre}
        </div>
        <div className={`${s.matricula} ${s.oneLine}`} title={alumno.matricula}>
          {alumno.matricula}
        </div>
      </div>

      <div className={`${s.cell} ${s.oneLine}`} data-label="Escolaridad" title={escolaridadNombre}>
        {escolaridadNombre}
      </div>

      <div className={`${s.cell} ${s.twoLines}`} data-label="Carrera" title={carreraNombre}>
        {carreraNombre}
      </div>

      <div className={`${s.cellMono} ${s.oneLine}`} data-label="Ingreso" title={alumno.fechaIngreso}>
        {alumno.fechaIngreso}
      </div>

      <div className={`${s.cellMono} ${s.oneLine}`} data-label="Término" title={alumno.fechaTermino}>
        {alumno.fechaTermino}
      </div>

      <div className={s.cell} data-label="Estado">
        <span className={`${s.pill} ${s[`pill_${alumno.estado}`]}`}>{estadoLabel(alumno.estado)}</span>
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
