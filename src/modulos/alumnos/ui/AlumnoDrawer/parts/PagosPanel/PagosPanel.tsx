'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, ReceiptText, Calendar } from 'lucide-react';

import s from './PagosPanel.module.css';
import type { PagoRealRow } from '../../types/alumno-drawer.types';

/** ✅ Para soportar el backend inconsistente sin usar any */
type MaybeQrPayLoad = { qrPayLoad?: string };

function hasQrPayLoad(v: unknown): v is MaybeQrPayLoad {
  return typeof v === 'object' && v !== null && 'qrPayLoad' in v;
}

function getQrPayload(p: PagoRealRow): string {
  const a = (p.qrPayload ?? '').trim();
  if (a) return a;

  // si por alguna razón el mapper no lo normalizó y llega qrPayLoad
  if (hasQrPayLoad(p)) {
    const b = (p.qrPayLoad ?? '').trim();
    if (b) return b;
  }
  return '';
}

function fmtMoney(n: number, currency = 'MXN') {
  const value = Number.isFinite(n) ? n : 0;
  try {
    const money = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 2,
    }).format(value);

    // ✅ Moneda al lado del precio (MXN $2,500.00)
    return `${currency} ${money}`;
  } catch {
    return `${currency} $${value.toFixed(2)}`;
  }
}

function fmtDate(isoLike?: string) {
  if (!isoLike) return '—';
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return isoLike;

  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(d);
}

function normalizeStatusLabel(p: PagoRealRow) {
  if (p.cancelado) return 'Cancelado';
  return p.estatusNombre || p.estatusCodigo || '—';
}

function statusTone(p: PagoRealRow) {
  if (p.cancelado) return 'danger';
  const t = `${p.estatusNombre ?? ''} ${p.estatusCodigo ?? ''}`.toLowerCase();
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

  /**
   * ✅ IMPORTANTE:
   * Mandamos alumnoId para que /recibos/print pueda reconstruir
   * el recibo vía GET /api/alumnos/{alumnoId}/pagos-resumen cuando
   * no exista sessionStorage (otro navegador/recarga/incógnito).
   */
  function onPrint(reciboId: number, alumnoId: string) {
    router.push(`/recibos/print?reciboId=${reciboId}&alumnoId=${encodeURIComponent(alumnoId)}`);
  }

  return (
    <section className={s.panel}>
      <header className={s.header}>
        <div className={s.titleBlock}>
          <div className={s.titleRow}>
            <span className={s.titleIcon}>
              <ReceiptText size={16} />
            </span>
            <div className={s.title}>Histórico de pagos</div>
          </div>
          <div className={s.subtitle}>Folio, fechas y QR del recibo.</div>
        </div>

        <div className={s.countPill}>
          {ordered.length} {ordered.length === 1 ? 'recibo' : 'recibos'}
        </div>
      </header>

      {ordered.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyTitle}>Aún no hay pagos registrados</div>
          <div className={s.emptyHint}>Cuando registres un pago, aquí aparecerá el recibo.</div>
        </div>
      ) : (
        <div className={s.list}>
          {ordered.map((p) => {
            const tone = statusTone(p);
            const statusLabel = normalizeStatusLabel(p);

            const tipoPagoTop = p.tipoPagoNombre || p.tipoPagoCodigo || '';

            // 👇 lo dejamos calculado “por si luego lo usas”, pero si no lo usas:
            // mejor bórralo para que no te regañe TS.
            void getQrPayload(p); // ✅ sin warning (y sin cambiar comportamiento)

            const canPrint = typeof p.reciboId === 'number' && p.reciboId > 0;

            return (
              <article key={`${p.reciboId}-${p.folio}`} className={s.card}>
                <div className={s.cardMain}>
                  <div className={s.top}>
                    <div className={s.conceptWrap}>
                      <div className={s.concept}>{p.concepto || '—'}</div>

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
                      >
                        {statusLabel}
                      </span>

                      {tipoPagoTop ? (
                        <span className={`${s.badge} ${s.badgeNeutral}`} title="Tipo de pago">
                          {tipoPagoTop}
                        </span>
                      ) : null}
                    </div>

                    <div className={s.amount}>{fmtMoney(p.monto, p.moneda || 'MXN')}</div>
                  </div>

                  <div className={s.metaGridSimple}>
                    <div className={s.metaPill}>
                      <span className={s.metaIcon}>
                        <ReceiptText size={14} />
                      </span>
                      <span className={s.metaKey}>Folio</span>
                      <span className={s.metaVal}>{p.folio || '—'}</span>
                    </div>

                    <div className={s.metaPill}>
                      <span className={s.metaIcon}>
                        <Calendar size={14} />
                      </span>
                      <span className={s.metaKey}>Pago</span>
                      <span className={s.metaVal}>{fmtDate(p.fechaPago)}</span>
                    </div>
                  </div>
                </div>

                <div className={s.actions}>
                  <button
                    className={s.iconBtn}
                    type="button"
                    onClick={() => canPrint && onPrint(p.reciboId, p.alumnoId)}
                    disabled={!canPrint}
                    title={canPrint ? 'Imprimir recibo' : 'No disponible'}
                  >
                    <Printer size={16} />
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