'use client';

import { Totals } from '../../types/alumno-drawer.types';
import s from './ResumenPanel.module.css';

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    Number.isFinite(n) ? n : 0,
  );
}

export default function ResumenPanel({
  totals,
  ingresoISO,
  terminoISO,
  duracionMeses,
  precioMensual,
  escNombre,
  carNombre,
  plaNombre,
  matricula,
}: {
  totals: Totals;

  ingresoISO: string;      // alumno.fechaIngreso
  terminoISO: string;      // alumno.fechaTermino ?? calculado UI
  duracionMeses: number;
  precioMensual: number;

  escNombre: string;
  carNombre: string;
  plaNombre: string;
  matricula: string;
}) {
  return (
    <section className={s.panel}>
      <div className={s.panelTitleRow}>
        <div className={s.panelTitle}>Resumen</div>
        <div className={s.panelHint}>Total, pagado y saldo pendiente.</div>
      </div>

      <div className={s.grid}>
        <div className={s.card}>
          <div className={s.label}>Próximo por pagar</div>

          {totals.nextDue ? (
            <div className={s.nextPay}>
              <div className={s.nextLeft}>
                <span className={s.mono}>{totals.nextDue.dueDate}</span>
                <span className={s.dot}>•</span>
                <b>{totals.nextDue.concept}</b>
              </div>
              <div className={s.nextRight}>
                <b>{formatMXN(totals.nextDue.amount)}</b>
              </div>
            </div>
          ) : (
            <div className={s.muted}>Todo el plan está pagado ✅</div>
          )}
        </div>

        <div className={s.card}>
          <div className={s.label}>Plan</div>
          <div className={s.kvGrid}>
            <div className={s.kv}><span>Ingreso</span><b className={s.mono}>{ingresoISO || '—'}</b></div>
            <div className={s.kv}><span>Término</span><b className={s.mono}>{terminoISO || '—'}</b></div>
            <div className={s.kv}><span>Duración</span><b>{Number.isFinite(duracionMeses) ? `${duracionMeses} meses` : '—'}</b></div>
            <div className={s.kv}><span>Precio mensual</span><b>{formatMXN(precioMensual)}</b></div>
          </div>
        </div>

        <div className={s.card}>
          <div className={s.label}>Academia</div>
          <div className={s.kvGrid}>
            <div className={s.kv}><span>Escolaridad</span><b>{escNombre || '—'}</b></div>
            <div className={s.kv}><span>Carrera</span><b title={carNombre}>{carNombre || '—'}</b></div>
            <div className={s.kv}><span>Plantel</span><b>{plaNombre || '—'}</b></div>
            <div className={s.kv}><span>Matrícula</span><b className={s.mono}>{matricula || '—'}</b></div>
          </div>
        </div>
      </div>
    </section>
  );
}
