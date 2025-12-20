'use client';

import { ProjectionItem } from '../../types/alumno-drawer.types';
import s from './ProyeccionPanel.module.css';

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    Number.isFinite(n) ? n : 0,
  );
}

function todayISO() {
  const d = new Date();
  const pad2 = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function cmpISO(a: string, b: string) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export default function ProyeccionPanel({
  projection,
  onPay,
  onReceipt,
}: {
  projection: ProjectionItem[];
  onPay: (dueDate: string) => void;
  onReceipt?: (paymentId: string) => void;
}) {
  return (
    <section className={s.panel}>
      <div className={s.panelTitleRow}>
        <div className={s.panelTitle}>Proyección</div>
        <div className={s.panelHint}>Todas las mensualidades del plan.</div>
      </div>

      <div className={s.list}>
        {projection.map((p) => {
          const isPastDue = p.status === 'PENDIENTE' && cmpISO(p.dueDate, todayISO()) < 0;
          const tag =
            p.status === 'PAGADO' ? (
              <span className={`${s.tag} ${s.tagOk}`}>Pagado</span>
            ) : (
              <span className={`${s.tag} ${isPastDue ? s.tagWarn : s.tagIdle}`}>
                {isPastDue ? 'Vencido' : 'Pendiente'}
              </span>
            );

          return (
            <div key={p.idx} className={s.item}>
              <div className={s.left}>
                <div className={s.titleLine}>
                  <b>{p.concept}</b>
                  <span className={s.dot}>•</span>
                  <span className={s.mono}>{p.dueDate}</span>
                </div>
                <div className={s.metaLine}>
                  {tag}
                  {p.method ? (
                    <>
                      <span className={s.dot}>•</span>
                      <span className={s.muted}>{p.method}</span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className={s.right}>
                <b className={s.amount}>{formatMXN(p.amount)}</b>

                {p.paymentId ? (
                  <button
                    className={s.linkBtn}
                    onClick={() => onReceipt?.(p.paymentId!)}
                    type="button"
                  >
                    Comprobante
                  </button>
                ) : (
                  <button className={s.linkBtn} onClick={() => onPay(p.dueDate)} type="button">
                    Pagar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
