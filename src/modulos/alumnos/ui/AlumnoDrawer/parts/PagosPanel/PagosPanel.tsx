'use client';

import s from './PagosPanel.module.css';
import type { PagoRealRow } from '../../types/alumno-drawer.types';

export default function PagosPanel({ pagos }: { pagos: PagoRealRow[] }) {
  return (
    <section className={s.panel}>
      <header className={s.header}>
        <div>
          <div className={s.title}>Pagos</div>
          <div className={s.subtitle}>Historial de recibos registrados.</div>
        </div>
      </header>

      {pagos.length === 0 ? (
        <div className={s.empty}>Aún no hay pagos registrados.</div>
      ) : (
        <div className={s.list}>
          {pagos.map((p) => (
            <div key={p.reciboId} className={s.row}>
              <div className={s.left}>
                <div className={s.top}>
                  <b>{p.concepto}</b>
                  <span className={s.dot}>•</span>
                  <span className={s.mono}>{p.fechaPago}</span>
                </div>
                <div className={s.meta}>
                  <span className={s.muted}>Folio:</span> <span className={s.mono}>{p.folio}</span>
                  <span className={s.dot}>•</span>
                  <span>{p.estatusNombre}</span>
                  {p.cancelado ? (
                    <>
                      <span className={s.dot}>•</span>
                      <span className={s.cancel}>Cancelado</span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className={s.right}>
                <b className={s.mono}>
                  ${p.monto.toFixed(2)} {p.moneda}
                </b>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
