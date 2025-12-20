'use client';

import s from './PagosPanel.module.css';
import type { PaymentItem, PaymentMethod } from '../../types/alumno-drawer.types';

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    Number.isFinite(n) ? n : 0,
  );
}

export default function PagosPanel({
  precioMensual,

  payDate,
  setPayDate,
  payMethod,
  setPayMethod,

  alumnoPayments,

  onAddMensualidad,
  onToggle,
  onRemove,
  onPrint,
}: {
  precioMensual: number;

  payDate: string;
  setPayDate: (v: string) => void;
  payMethod: PaymentMethod;
  setPayMethod: (v: PaymentMethod) => void;

  alumnoPayments: PaymentItem[];

  onAddMensualidad: () => void;
  onToggle: (paymentId: string) => void;
  onRemove: (paymentId: string) => void;
  onPrint: (paymentId: string) => void;
}) {
  return (
    <section className={s.grid2}>
      {/* Registrar */}
      <div className={s.card}>
        <div className={s.titleRow}>
          <div className={s.title}>Registrar pago</div>
          <div className={s.hint}>Mensualidad del plan.</div>
        </div>

        <div className={s.formRow}>
          <label className={s.label}>Fecha (mensualidad)</label>
          <input className={s.input} type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
        </div>

        <div className={s.formRow}>
          <label className={s.label}>Método</label>
          <select className={s.select} value={payMethod} onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>

        <div className={s.formRow}>
          <label className={s.label}>Monto</label>
          <div className={s.readonly}>
            <b>{formatMXN(precioMensual)}</b>
            <span>mensual</span>
          </div>
        </div>

        <button className={s.primaryBtn} onClick={onAddMensualidad} type="button">
          Registrar pago
        </button>

        <div className={s.smallHint}>
          Tip: si pagas una mensualidad futura, usa la fecha exacta de esa mensualidad.
        </div>
      </div>

      {/* Historial */}
      <div className={s.card}>
        <div className={s.titleRow}>
          <div className={s.title}>Historial</div>
          <div className={s.hint}>Pagos registrados y comprobantes.</div>
        </div>

        {alumnoPayments.length === 0 ? (
          <div className={s.emptyBox}>Aún no hay pagos registrados.</div>
        ) : (
          <div className={s.list}>
            {alumnoPayments.map((p) => (
              <div key={p.id} className={s.row}>
                <div className={s.rowLeft}>
                  <div className={s.rowTitle}>
                    <b title={p.concept}>{p.concept}</b>
                    <span className={s.dot}>•</span>
                    <span className={s.mono}>{p.date}</span>
                  </div>

                  <div className={s.rowMeta}>
                    <span className={`${s.tag} ${p.status === 'PAGADO' ? s.tagOk : s.tagIdle}`}>
                      {p.status === 'PAGADO' ? 'Pagado' : 'Pendiente'}
                    </span>
                    <span className={s.dot}>•</span>
                    <span className={s.muted}>{p.method}</span>
                    <span className={s.dot}>•</span>
                    <span className={s.muted}>{p.type === 'MENSUALIDAD' ? 'Mensualidad' : 'Extra'}</span>
                  </div>
                </div>

                <div className={s.rowRight}>
                  <b className={s.amount}>{formatMXN(p.amount)}</b>
                  <div className={s.actions}>
                    <button className={s.linkBtn} onClick={() => onPrint(p.id)} type="button">
                      Comprobante
                    </button>
                    <button className={s.linkBtn} onClick={() => onToggle(p.id)} type="button">
                      {p.status === 'PAGADO' ? 'Marcar pendiente' : 'Marcar pagado'}
                    </button>
                    <button className={s.dangerBtn} onClick={() => onRemove(p.id)} type="button">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
