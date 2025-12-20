'use client';

import s from './ResumenPanel.module.css';
import type { Totals } from '../../types/alumno-drawer.types';

export default function ResumenPanel({
  totals,
  ingresoISO,
  terminoISO,
  precioMensual,
  montoInscripcion,
  escNombre,
  carNombre,
  plaNombre,
  matricula,
}: {
  totals: Totals;
  ingresoISO: string;
  terminoISO: string;
  precioMensual: number;
  montoInscripcion: number;
  escNombre: string;
  carNombre: string;
  plaNombre: string;
  matricula: string;
}) {
  return (
    <section className={s.panel}>
      <div className={s.titleRow}>
        <div className={s.title}>Resumen</div>
        <div className={s.hint}>Plan, academia y totales.</div>
      </div>

      <div className={s.grid}>
        <div className={s.card}>
          <div className={s.cardTitle}>Plan</div>
          <div className={s.kv}><span>Ingreso</span><b className={s.mono}>{ingresoISO}</b></div>
          <div className={s.kv}><span>Término</span><b className={s.mono}>{terminoISO}</b></div>
          <div className={s.kv}><span>Mensualidad</span><b className={s.mono}>${precioMensual.toFixed(2)}</b></div>
          <div className={s.kv}><span>Inscripción</span><b className={s.mono}>${montoInscripcion.toFixed(2)}</b></div>
        </div>

        <div className={s.card}>
          <div className={s.cardTitle}>Totales</div>
          <div className={s.kv}><span>Total proyectado</span><b className={s.mono}>${totals.totalPlan.toFixed(2)}</b></div>
          <div className={s.kv}><span>Pagado</span><b className={s.mono}>${totals.totalPagado.toFixed(2)}</b></div>
          <div className={s.kv}><span>Saldo</span><b className={s.mono}>${totals.saldo.toFixed(2)}</b></div>
        </div>

        <div className={s.card}>
          <div className={s.cardTitle}>Academia</div>
          <div className={s.kv}><span>Escolaridad</span><b>{escNombre}</b></div>
          <div className={s.kv}><span>Carrera</span><b title={carNombre}>{carNombre}</b></div>
          <div className={s.kv}><span>Plantel</span><b>{plaNombre}</b></div>
          <div className={s.kv}><span>Matrícula</span><b className={s.mono}>{matricula}</b></div>
        </div>
      </div>
    </section>
  );
}
