'use client';

import { Totals } from '../../types/alumno-drawer.types';
import s from './StickySummary.module.css';

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    Number.isFinite(n) ? n : 0,
  );
}

export default function StickySummary({ totals }: { totals: Totals }) {
  return (
    <div className={s.sticky}>
      <div className={s.kpiRow}>
        <div className={s.kpiBox}>
          <span>Total del plan</span>
          <b>{formatMXN(totals.totalPlan + totals.totalExtras)}</b>
        </div>
        <div className={s.kpiBox}>
          <span>Pagado</span>
          <b>{formatMXN(totals.totalPagado)}</b>
        </div>
        <div className={s.kpiBox}>
          <span>Saldo</span>
          <b>{formatMXN(totals.saldo)}</b>
        </div>
      </div>

      <div className={s.statsRow}>
        <div className={s.stat}>
          <b>{totals.pagados}</b>
          <span>Pagados</span>
        </div>
        <div className={s.stat}>
          <b>{totals.pendientes}</b>
          <span>Pendientes</span>
        </div>
        <div className={s.stat}>
          <b>{totals.vencidos}</b>
          <span>Vencidos</span>
        </div>
      </div>
    </div>
  );
}
