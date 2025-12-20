'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, Copy, ReceiptText } from 'lucide-react';

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
    return `$${Number.isFinite(n) ? n.toFixed(2) : '0.00'} ${currency}`;
  }
}

function fmtDate(isoLike: string) {
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
  if (t.includes('pagado') || t.includes('aplicado') || t.includes('vigente')) return 'ok';
  if (t.includes('pend') || t.includes('por pagar')) return 'warn';
  if (t.includes('cancel')) return 'danger';
  return 'neutral';
}

export default function PagosPanel({ pagos }: { pagos: PagoRealRow[] }) {
  const router = useRouter();

  const ordered = useMemo(() => {
    return [...pagos].sort((a, b) => {
      const da = new Date(a.fechaPago).getTime();
      const db = new Date(b.fechaPago).getTime();
      if (Number.isNaN(da) || Number.isNaN(db)) return 0;
      return db - da;
    });
  }, [pagos]);

  function onPrint(reciboId: number) {
    router.push(`/recibos/print?reciboId=${reciboId}`);
  }

  async function copyText(v: string) {
    try {
      await navigator.clipboard.writeText(v);
    } catch {
      // fallback ultra simple
      const el = document.createElement('textarea');
      el.value = v;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  }

  return (
    <section className={s.panel}>
      <header className={s.header}>
        <div className={s.titleBlock}>
          <div className={s.titleRow}>
            <ReceiptText size={16} />
            <div className={s.title}>Pagos</div>
          </div>
          <div className={s.subtitle}>Historial de recibos registrados.</div>
        </div>

        <div className={s.countPill}>
          {ordered.length} {ordered.length === 1 ? 'recibo' : 'recibos'}
        </div>
      </header>

      {ordered.length === 0 ? (
        <div className={s.empty}>Aún no hay pagos registrados.</div>
      ) : (
        <div className={s.list}>
          {ordered.map((p) => {
            const tone = statusTone(p.estatusNombre, p.cancelado);
            const canPrint = typeof p.reciboId === 'number' && p.reciboId > 0;

            return (
              <article key={p.reciboId} className={s.card}>
                <div className={s.cardMain}>
                  <div className={s.top}>
                    <div className={s.conceptWrap}>
                      <div className={s.concept} title={p.concepto}>
                        {p.concepto || '—'}
                      </div>

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

                    <div className={s.amount}>
                      {fmtMoney(p.monto, p.moneda || 'MXN')}
                    </div>
                  </div>

                  <div className={s.meta}>
                    <span className={s.metaLabel}>Folio</span>
                    <span className={s.mono}>{p.folio || '—'}</span>

                    <span className={s.dot}>•</span>

                    <span className={s.metaLabel}>Fecha</span>
                    <span className={s.mono}>{fmtDate(p.fechaPago)}</span>
                  </div>
                </div>

                <div className={s.actions}>
                  <button
                    className={s.iconBtn}
                    type="button"
                    onClick={() => copyText(String(p.folio || ''))}
                    disabled={!p.folio}
                    title={p.folio ? 'Copiar folio' : 'Sin folio'}
                  >
                    <Copy size={16} />
                  </button>

                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
