'use client';

import s from './PagosPanel.module.css';
import type { PagoRealRow } from '../../types/alumno-drawer.types';

function fmtMoney(n: number, currency = 'MXN') {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    // fallback si llega una moneda rara
    return `$${n.toFixed(2)} ${currency}`;
  }
}

function fmtDate(isoLike: string) {
  // Si te llega "2025-12-20" lo formatea; si llega otra cosa, regresa igual.
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return isoLike;

  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(d);
}

function statusTone(estatusNombre: string, cancelado?: boolean) {
  if (cancelado) return 'danger';
  const t = (estatusNombre ?? '').toLowerCase();
  if (t.includes('pagado') || t.includes('aplicado') || t.includes('vigente'))
    return 'ok';
  if (t.includes('pend') || t.includes('por pagar')) return 'warn';
  if (t.includes('cancel')) return 'danger';
  return 'neutral';
}

export default function PagosPanel({ pagos }: { pagos: PagoRealRow[] }) {
  const ordered = [...pagos].sort((a, b) => {
    // más recientes arriba
    const da = new Date(a.fechaPago).getTime();
    const db = new Date(b.fechaPago).getTime();
    if (Number.isNaN(da) || Number.isNaN(db)) return 0;
    return db - da;
  });

  return (
    <section className={s.panel}>
      <header className={s.header}>
        <div>
          <div className={s.title}>Pagos</div>
          <div className={s.subtitle}>Historial de recibos registrados.</div>
        </div>
      </header>

      {ordered.length === 0 ? (
        <div className={s.empty}>Aún no hay pagos registrados.</div>
      ) : (
        <div className={s.list}>
          {ordered.map((p) => {
            const tone = statusTone(p.estatusNombre, p.cancelado);

            return (
              <div key={p.reciboId} className={s.row}>
                <div className={s.left}>
                  {/* línea superior: concepto + badge */}
                  <div className={s.top}>
                    <b className={s.concept}>{p.concepto}</b>

                    <span
                      className={`${s.badge} ${
                        tone === 'ok'
                          ? s.badgeOk
                          : tone === 'warn'
                          ? s.badgeWarn
                          : tone === 'danger'
                          ? s.badgeDanger
                          : s.badgeNeutral
                      }`}
                      title={p.cancelado ? 'Recibo cancelado' : p.estatusNombre}
                    >
                      {p.cancelado ? 'Cancelado' : p.estatusNombre}
                    </span>
                  </div>

                  {/* meta: folio + fecha */}
                  <div className={s.meta}>
                    <span className={s.muted}>Folio</span>
                    <span className={s.mono}>{p.folio || '—'}</span>

                    <span className={s.dot}>•</span>

                    <span className={s.muted}>Fecha</span>
                    <span className={s.mono}>{fmtDate(p.fechaPago)}</span>
                  </div>
                </div>

                <div className={s.right}>
                  <b className={`${s.mono} ${s.amount}`}>
                    {fmtMoney(p.monto, p.moneda || 'MXN')}
                  </b>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
