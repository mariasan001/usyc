'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Printer, QrCode, Check, ReceiptText } from 'lucide-react';

import s from './HistoricoTableCard.module.css';
import type { ReciboHistoricoDTO } from '../../types/historico.types';

function fmtMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'MXN',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 2,
    }).format(Number.isFinite(n) ? n : 0);
  } catch {
    return `$${Number.isFinite(n) ? n.toFixed(2) : '0.00'} ${currency || 'MXN'}`;
  }
}

function fmtDate(isoLike: string) {
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return isoLike || '—';
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: '2-digit' }).format(d);
}

function statusTone(estatusNombre: string, cancelado: boolean) {
  if (cancelado) return 'danger';
  const t = (estatusNombre ?? '').toLowerCase();
  if (t.includes('pagado') || t.includes('aplicado') || t.includes('vigente')) return 'ok';
  if (t.includes('pend') || t.includes('por pagar')) return 'warn';
  if (t.includes('cancel')) return 'danger';
  return 'neutral';
}

async function copyText(v: string) {
  if (!v) return;
  try {
    await navigator.clipboard.writeText(v);
  } catch {
    const el = document.createElement('textarea');
    el.value = v;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

export default function HistoricoTableCard({
  items,
  loading,
  error,
}: {
  items: ReciboHistoricoDTO[];
  loading: boolean;
  error: string | null;
}) {
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const ordered = useMemo(() => {
    return [...(items ?? [])].sort((a, b) => {
      const da = new Date(a.fechaPago).getTime();
      const db = new Date(b.fechaPago).getTime();
      if (Number.isNaN(da) || Number.isNaN(db)) return 0;
      return db - da;
    });
  }, [items]);

  async function onCopy(key: string, value: string) {
    await copyText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 900);
  }

  function onPrint(reciboId: number) {
    router.push(`/recibos/print?reciboId=${encodeURIComponent(String(reciboId))}`);
  }

  return (
    <section className={s.card}>
      <header className={s.header}>
        <div className={s.titleBlock}>
          <div className={s.titleRow}>
            <ReceiptText size={16} />
            <div className={s.title}>Históricos</div>
          </div>
          <div className={s.subtitle}>Todos los recibos visibles para tu sesión (por plantel o admin).</div>
        </div>

        <div className={s.countPill}>
          {ordered.length} {ordered.length === 1 ? 'recibo' : 'recibos'}
        </div>
      </header>

      {error ? <div className={s.error}>{error}</div> : null}

      {loading ? (
        <div className={s.loading}>Cargando recibos…</div>
      ) : ordered.length === 0 ? (
        <div className={s.empty}>No hay recibos para mostrar.</div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Pago</th>
                <th>Alumno</th>
                <th>Concepto</th>
                <th className={s.tRight}>Monto</th>
                <th>Tipo</th>
                <th>Estatus</th>
                <th className={s.tCenter}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {ordered.map((r) => {
                const tone = statusTone(r.estatusNombre, r.cancelado);
                const money = fmtMoney(r.monto, r.moneda);
                const keyQr = `qr:${r.reciboId}`;
                const keyFolio = `folio:${r.reciboId}`;

                return (
                  <tr key={r.reciboId}>
                    <td className={s.mono}>
                      <div className={s.folioCell}>
                        <span className={s.oneLine} title={r.folio}>
                          {r.folio || '—'}
                        </span>
                        {r.folioLegacy ? (
                          <span className={s.legacy} title={`Legacy: ${r.folioLegacy}`}>
                            {r.folioLegacy}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className={s.mono}>{fmtDate(r.fechaPago)}</td>

                    <td title={`${r.alumnoNombre} (${r.alumnoId})`}>
                      <div className={s.alumnoCell}>
                        <span className={s.oneLine}>{r.alumnoNombre || '—'}</span>
                        <span className={s.monoSoft}>{r.alumnoId || '—'}</span>
                      </div>
                    </td>

                    <td className={s.oneLine} title={r.concepto}>
                      {r.concepto || '—'}
                    </td>

                    <td className={`${s.mono} ${s.tRight}`} title={money}>
                      {money}
                    </td>

                    <td className={s.oneLine} title={r.tipoPagoName}>
                      {r.tipoPagoName || '—'}
                    </td>

                    <td>
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
                        title={r.cancelado ? 'Cancelado' : r.estatusNombre}
                      >
                        {r.cancelado ? 'Cancelado' : r.estatusNombre || '—'}
                      </span>
                    </td>

                    <td className={s.tCenter}>
                      <div className={s.actions}>
                        <button
                          className={s.primaryBtn}
                          type="button"
                          onClick={() => onCopy(keyQr, r.qrPayload)}
                          disabled={!r.qrPayload}
                          title={r.qrPayload ? 'Copiar QR Payload' : 'Sin QR Payload'}
                        >
                          {copiedKey === keyQr ? <Check size={16} /> : <QrCode size={16} />}
                          <span>{copiedKey === keyQr ? 'Copiado' : 'Copiar QR'}</span>
                        </button>

                        <button
                          className={s.iconBtn}
                          type="button"
                          onClick={() => onCopy(keyFolio, r.folio)}
                          disabled={!r.folio}
                          title={r.folio ? 'Copiar folio' : 'Sin folio'}
                        >
                          {copiedKey === keyFolio ? <Check size={16} /> : <Copy size={16} />}
                        </button>

                        <button
                          className={s.iconBtn}
                          type="button"
                          onClick={() => onPrint(r.reciboId)}
                          title="Imprimir"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
