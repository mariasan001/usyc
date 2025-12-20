'use client';

import s from './ProyeccionPanel.module.css';
import type { ProjectionRow } from '../../types/alumno-drawer.types';

export default function ProyeccionPanel({
  rows,
  onPay,
  onReceipt,
}: {
  rows: ProjectionRow[];
  onPay: (row: ProjectionRow) => void;
  onReceipt: (reciboId: number) => void;
}) {
  return (
    <section className={s.panel}>
      <header className={s.header}>
        <div>
          <div className={s.title}>Proyección</div>
          <div className={s.subtitle}>Calendario completo de pagos.</div>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className={s.empty}>Aún no hay proyección.</div>
      ) : (
        <div className={s.table}>
          <div className={s.trHead}>
            <div>#</div>
            <div>Periodo</div>
            <div>Vence</div>
            <div>Concepto</div>
            <div className={s.right}>Monto</div>
            <div>Estado</div>
            <div className={s.right}>Acción</div>
          </div>

          {rows.map((r) => (
            <div className={s.tr} key={`${r.periodo}_${r.idx}`}>
              <div>{r.idx}</div>
              <div className={s.mono}>{r.periodo}</div>
              <div className={s.mono}>{r.dueDate}</div>
              <div>{r.conceptCode}</div>
              <div className={`${s.mono} ${s.right}`}>${r.amount.toFixed(2)}</div>

              <div className={r.isPaid ? s.paid : s.pending}>
                {r.isPaid ? 'Pagado' : r.estado}
              </div>

              <div className={s.right}>
                {r.isPaid && typeof r.reciboId === 'number' ? (
                  <button
                    className={s.linkBtn}
                    type="button"
                    onClick={() => onReceipt(r.reciboId!)}
                  >
                    Recibo
                  </button>
                ) : (
                  <button
                    className={s.primaryBtn}
                    type="button"
                    onClick={() => onPay(r)}
                  >
                    Pagar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
