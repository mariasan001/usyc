'use client';

import { Totals } from '../../types/alumno-drawer.types';
import s from './StickySummary.module.css';

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    Number.isFinite(n) ? n : 0,
  );
}

export default function StickySummary({ totals }: { totals: Totals }) {
  const totalPlan = totals.totalPlan ?? 0;
  const totalExtras = totals.totalExtras ?? 0;
  const totalPagado = totals.totalPagado ?? 0;
  const saldo = totals.saldo ?? 0;

  const totalProyectado = totalPlan + totalExtras;

  return (
    <div className={s.sticky}>
      <div className={s.kpiRow}>
        <div className={s.kpiBox}>
          <span>Total proyectado</span>
          <b>{formatMXN(totalProyectado)}</b>
          <small className={s.kpiHint}>
            Incluye plan académico{totalExtras > 0 ? ' y cargos extra' : ''}.
          </small>

          {totalExtras > 0 ? (
            <div className={s.subNote} title="Total proyectado de cargos extra">
              Extras: <b className={s.subMoney}>{formatMXN(totalExtras)}</b>
            </div>
          ) : null}
        </div>

        <div className={s.kpiBox}>
          <span>Pagado</span>
          <b>{formatMXN(totalPagado)}</b>
          <small className={s.kpiHint}>Pagos realizados y saldados.</small>
        </div>

        <div className={s.kpiBox}>
          <span>Saldo</span>
          <b>{formatMXN(saldo)}</b>
          <small className={s.kpiHint}>Monto pendiente por cubrir.</small>
        </div>
      </div>

      <div className={s.statsRow}>
        <div className={s.stat}>
          <b>{totals.pagados ?? 0}</b>
          <span>Pagados</span>
        </div>
        <div className={s.stat}>
          <b>{totals.pendientes ?? 0}</b>
          <span>Pendientes</span>
        </div>
        <div className={s.stat}>
          <b>{totals.vencidos ?? 0}</b>
          <span>Vencidos</span>
        </div>
      </div>
    </div>
  );
}
