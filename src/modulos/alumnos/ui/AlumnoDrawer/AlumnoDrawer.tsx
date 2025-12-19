// src/modulos/alumnos/ui/AlumnoDrawer/AlumnoDrawer.tsx
'use client';

import s from './AlumnoDrawer.module.css';
import type { Alumno } from '../../types/alumnos.tipos';
import { getCarreraById, getEscolaridadById, getPlantelById } from '../../constants/catalogos.constants';

export default function AlumnoDrawer({
  open,
  alumno,
  onClose,
}: {
  open: boolean;
  alumno: Alumno | null;
  onClose: () => void;
}) {
  if (!open) return null;

  const esc = getEscolaridadById(alumno?.escolaridadId ?? null);
  const car = getCarreraById(alumno?.carreraId ?? null);
  const pla = getPlantelById(alumno?.plantelId ?? null);

  return (
    <div className={s.backdrop} onMouseDown={onClose}>
      <aside className={s.drawer} onMouseDown={(e) => e.stopPropagation()}>
        <header className={s.header}>
          <div>
            <div className={s.title}>Detalle</div>
            <div className={s.subtitle}>Alumno + datos académicos</div>
          </div>
          <button className={s.close} onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        {!alumno ? (
          <div className={s.empty}>Sin selección.</div>
        ) : (
          <div className={s.content}>
            <div className={s.block}>
              <div className={s.blockTitle}>Identidad</div>
              <div className={s.kv}>
                <span>Nombre</span>
                <b>{alumno.nombre}</b>
              </div>
              <div className={s.kv}>
                <span>Matrícula</span>
                <b>{alumno.matricula}</b>
              </div>
            </div>

            <div className={s.block}>
              <div className={s.blockTitle}>Academia</div>
              <div className={s.kv}>
                <span>Escolaridad</span>
                <b>{esc?.nombre ?? '—'}</b>
              </div>
              <div className={s.kv}>
                <span>Carrera</span>
                <b>{car?.nombre ?? '—'}</b>
              </div>
              <div className={s.kv}>
                <span>Plantel</span>
                <b>{pla?.nombre ?? '—'}</b>
              </div>
            </div>

            <div className={s.block}>
              <div className={s.blockTitle}>Tiempos y costo</div>
              <div className={s.kv}>
                <span>Ingreso</span>
                <b>{alumno.fechaIngreso}</b>
              </div>
              <div className={s.kv}>
                <span>Término</span>
                <b>{alumno.fechaTermino}</b>
              </div>
              <div className={s.kv}>
                <span>Duración</span>
                <b>{alumno.duracionMeses} meses</b>
              </div>
              <div className={s.kv}>
                <span>Precio mensual</span>
                <b>${alumno.precioMensual.toLocaleString('es-MX')}</b>
              </div>
            </div>

            <div className={s.future}>
              <div className={s.futureTitle}>Próximamente</div>
              <ul className={s.futureList}>
                <li>Historial de pagos</li>
                <li>Generar recibo</li>
                <li>Estatus por pagos</li>
              </ul>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
