// src/modulos/corte-caja/ui/CorteCajaTableCard/CorteCajaTableCard.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Printer, Check, ReceiptText, BadgeDollarSign, Ban } from 'lucide-react';

import s from './CorteCajaTableCard.module.css';
import type { CorteCajaDTO, CorteCajaReciboDTO } from '../../types/corte-caja.types';

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
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(d);
}

function statusTone(estatusDesc: string, cancelado: boolean) {
  if (cancelado) return 'danger';
  const t = (estatusDesc ?? '').toLowerCase();
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

export default function CorteCajaTableCard({
  data,
  recibos,
  loading,
  error,
}: {
  data: CorteCajaDTO | null;
  recibos: CorteCajaReciboDTO[];
  loading: boolean;
  error: string | null;
}) {
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const ordered = useMemo(() => {
    return [...(recibos ?? [])].sort((a, b) => {
      const da = new Date(a.fechaPago).getTime();
      const db = new Date(b.fechaPago).getTime();
      if (Number.isNaN(da) || Number.isNaN(db)) return 0;
      return db - da;
    });
  }, [recibos]);

  async function onCopy(key: string, value: string) {
    await copyText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 900);
  }

  function onPrint(reciboId: number, alumnoId?: string | null) {
    
    const rid = encodeURIComponent(String(reciboId));
    const aid = (alumnoId ?? '').trim();

    if (aid) {
      router.push(`/recibos/print?reciboId=${rid}&alumnoId=${encodeURIComponent(aid)}`);
      return;
    }

    router.push(`/recibos/print?reciboId=${rid}`);
  }

  const resumen = data?.resumen ?? null;
  const porTipo = data?.porTipoPago ?? [];

  // Texto de rango (solo UI)
  const rangoTexto =
    data?.fechaInicio && data?.fechaFin
      ? data.fechaInicio === data.fechaFin
        ? fmtDate(data.fechaInicio)
        : `${fmtDate(data.fechaInicio)} → ${fmtDate(data.fechaFin)}`
      : null;

  return (
    <section className={s.card}>
      <header className={s.header}>
        <div className={s.titleBlock}>
          <div className={s.titleRow}>
            <ReceiptText size={16} />
            <div className={s.title}>Corte de caja</div>
          </div>

          <div className={s.subtitle}>
            Resumen por rango de fecha de pago{rangoTexto ? ` · ${rangoTexto}` : ''}.
          </div>
        </div>

        <div className={s.rightMeta}>
          <div className={s.countPill}>
            {ordered.length} {ordered.length === 1 ? 'recibo' : 'recibos'}
          </div>
        </div>
      </header>

      {error ? <div className={s.error}>{error}</div> : null}

      {/* Resumen superior */}
      {resumen ? (
        <div className={s.summaryGrid}>
          <div className={s.summaryCard}>
            <div className={s.summaryIcon}>
              <BadgeDollarSign size={18} />
            </div>
            <div className={s.summaryMeta}>
              <div className={s.summaryLabel}>Total recibos</div>
              <div className={s.summaryValue}>{resumen.totalRecibos}</div>
            </div>
          </div>

          <div className={s.summaryCard}>
            <div className={s.summaryIcon}>
              <BadgeDollarSign size={18} />
            </div>
            <div className={s.summaryMeta}>
              <div className={s.summaryLabel}>Total monto</div>
              <div className={s.summaryValue}>{fmtMoney(resumen.totalMonto, 'MXN')}</div>
            </div>
          </div>

          <div className={s.summaryCardDanger}>
            <div className={s.summaryIcon}>
              <Ban size={18} />
            </div>
            <div className={s.summaryMeta}>
              <div className={s.summaryLabel}>Cancelados</div>
              <div className={s.summaryValue}>{resumen.totalCancelados}</div>
            </div>
          </div>

          <div className={s.summaryCardDanger}>
            <div className={s.summaryIcon}>
              <Ban size={18} />
            </div>
            <div className={s.summaryMeta}>
              <div className={s.summaryLabel}>Monto cancelado</div>
              <div className={s.summaryValue}>{fmtMoney(resumen.totalMontoCancelado, 'MXN')}</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Por tipo de pago */}
      {porTipo.length ? (
        <div className={s.byType}>
          <div className={s.byTypeTitle}>Por tipo de pago</div>

          <div className={s.byTypeTableWrap}>
            <table className={s.byTypeTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th className={s.tRight}>Recibos</th>
                  <th className={s.tRight}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {porTipo.map((t) => (
                  <tr key={t.tipoPagoId}>
                    <td className={s.oneLine} title={t.tipoPagoDesc}>
                      {t.tipoPagoDesc}
                    </td>
                    <td className={s.tRight}>{t.totalRecibos}</td>
                    <td className={s.tRight}>{fmtMoney(t.totalMonto, 'MXN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Tabla principal */}
      {loading ? (
        <div className={s.loading}>Cargando corte de caja…</div>
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
                const tone = statusTone(r.estatusDesc, r.cancelado);
                const money = fmtMoney(r.monto, r.moneda);
                const keyFolio = `folio:${r.reciboId}`;
                const keyAlumno = `alumno:${r.reciboId}`;

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

                    <td className={s.oneLine} title={r.tipoPagoDesc}>
                      {r.tipoPagoDesc || '—'}
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
                        title={r.cancelado ? 'Cancelado' : r.estatusDesc}
                      >
                        {r.cancelado ? 'Cancelado' : r.estatusDesc || '—'}
                      </span>
                    </td>

                    <td className={s.tCenter}>
                      <div className={s.actions}>
                        <button
                          className={s.primaryBtn}
                          type="button"
                          onClick={() => onCopy(keyAlumno, r.alumnoId)}
                          disabled={!r.alumnoId}
                          title="Copiar ID de alumno"
                        >
                          {copiedKey === keyAlumno ? <Check size={16} /> : <Copy size={16} />}
                          <span>{copiedKey === keyAlumno ? 'Copiado' : 'Copiar alumno'}</span>
                        </button>

                        <button
                          className={s.iconBtn}
                          type="button"
                          onClick={() => onCopy(keyFolio, r.folio)}
                          disabled={!r.folio}
                          title="Copiar folio"
                        >
                          {copiedKey === keyFolio ? <Check size={16} /> : <Copy size={16} />}
                        </button>

                        <button
                          className={s.iconBtn}
                          type="button"
                          onClick={() => onPrint(r.reciboId, r.alumnoId)}
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