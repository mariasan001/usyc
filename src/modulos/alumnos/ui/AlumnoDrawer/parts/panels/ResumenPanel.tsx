'use client';

import s from './ResumenPanel.module.css';

export default function ResumenPanel({
  ingresoISO,
  terminoISO,
  precioMensual,
  montoInscripcion,
  escNombre,
  carNombre,
  plaNombre,
  matricula,
}: {
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
        <div className={s.hint}>Plan y academia.</div>
      </div>

      <div className={s.grid}>
        <div className={s.card}>
          <div className={s.cardTitle}>Plan</div>

          <div className={s.kv}>
            <span>Ingreso</span>
            <b className={s.mono}>{ingresoISO}</b>
          </div>

          <div className={s.kv}>
            <span>Término</span>
            <b className={s.mono}>{terminoISO}</b>
          </div>

          <div className={s.kv}>
            <span>Mensualidad</span>
            <b className={s.mono}>${precioMensual.toFixed(2)}</b>
          </div>

          <div className={s.kv}>
            <span>Inscripción</span>
            <b className={s.mono}>${montoInscripcion.toFixed(2)}</b>
          </div>
        </div>

        <div className={s.card}>
          <div className={s.cardTitle}>Academia</div>

          <div className={s.kv}>
            <span>Escolaridad</span>
            <b title={escNombre}>{escNombre}</b>
          </div>

          <div className={s.kv}>
            <span>Carrera</span>
            <b title={carNombre}>{carNombre}</b>
          </div>

          <div className={s.kv}>
            <span>Plantel</span>
            <b title={plaNombre}>{plaNombre}</b>
          </div>

          <div className={s.kv}>
            <span>Matrícula</span>
            <b className={s.mono}>{matricula}</b>
          </div>
        </div>
      </div>
    </section>
  );
}
