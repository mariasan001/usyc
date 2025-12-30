'use client';

import { useMemo, useState } from 'react';
import { Ban, CheckCircle2, Copy, AlertTriangle } from 'lucide-react';

import s from './CanceladosTableCard.module.css';
import type { ReciboCanceladoRow } from '../../types/cancelados.types';
import { useCancelarRecibo } from '../../hooks/useCancelados';

// ✅ Asegúrate que este import exista con ese nombre/archivo.
// Si tu hook está en useCancelarRecibo.ts, usa:
// import { useCancelarRecibo } from '../../hooks/useCancelarRecibo';

function fmtMoney(n: number, currency = 'MXN') {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 2,
    }).format(Number.isFinite(n) ? n : 0);
  } catch {
    return `$${Number.isFinite(n) ? n.toFixed(2) : '0.00'} ${currency}`;
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

function isPositiveIntString(v: string) {
  if (!v) return false;
  const n = Number(v);
  return Number.isInteger(n) && n > 0;
}

/* ✅ Componentes FUERA del render */
function Result({ r }: { r: ReciboCanceladoRow }) {
  return (
    <div className={s.result}>
      <div className={s.resultHead}>
        <div className={s.resultTitle}>
          <CheckCircle2 size={16} />
          Recibo cancelado correctamente
        </div>

        <button
          className={s.primaryBtn}
          type="button"
          onClick={() => copyText(String(r.reciboId))}
          title="Copiar reciboId"
        >
          <Copy size={16} />
          Copiar ID
        </button>
      </div>

      <div className={s.grid}>
        <div className={s.item}>
          <span className={s.label}>Folio</span>
          <span className={`${s.mono} ${s.oneLine}`} title={r.folio}>
            {r.folio}
          </span>
          {r.folioLegacy ? <span className={s.legacy}>Legacy: {r.folioLegacy}</span> : null}
        </div>

        <div className={s.item}>
          <span className={s.label}>Alumno</span>
          <span className={s.oneLine} title={r.alumnoNombre}>
            {r.alumnoNombre}
          </span>
          <span className={s.monoSoft}>{r.alumnoId}</span>
        </div>

        <div className={s.item}>
          <span className={s.label}>Concepto</span>
          <span className={s.oneLine} title={r.concepto}>
            {r.concepto}
          </span>
        </div>

        <div className={s.item}>
          <span className={s.label}>Monto</span>
          <span className={s.mono}>{fmtMoney(r.monto, r.moneda || 'MXN')}</span>
        </div>

        <div className={s.item}>
          <span className={s.label}>Emisión</span>
          <span className={s.mono}>{fmtDate(r.fechaEmision)}</span>
        </div>

        <div className={s.item}>
          <span className={s.label}>Pago</span>
          <span className={s.mono}>{fmtDate(r.fechaPago)}</span>
        </div>

        <div className={s.itemWide}>
          <span className={s.label}>QR Payload</span>
          <div className={s.qrRow}>
            <span className={`${s.mono} ${s.qrValue}`} title={r.qrPayload}>
              {r.qrPayload || '—'}
            </span>

            <button
              className={s.iconBtn}
              type="button"
              onClick={() => copyText(r.qrPayload)}
              disabled={!r.qrPayload}
              title={r.qrPayload ? 'Copiar QR Payload' : 'Sin QR Payload'}
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CancelarReciboCard() {
  const c = useCancelarRecibo();

  const [reciboIdText, setReciboIdText] = useState('');
  const [motivo, setMotivo] = useState('');

  const reciboIdOk = useMemo(() => isPositiveIntString(reciboIdText), [reciboIdText]);
  const motivoOk = useMemo(() => motivo.trim().length >= 3, [motivo]);

  const disabled = c.loading || !reciboIdOk || !motivoOk;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;

    const reciboId = Number(reciboIdText);
    await c.cancelar(reciboId, motivo.trim());
  }

  return (
    <section className={s.card}>
      <header className={s.header}>
        <div className={s.titleBlock}>
          <div className={s.titleRow}>
            <Ban size={16} />
            <div className={s.title}>Cancelar recibo</div>
          </div>
          <div className={s.subtitle}>
            Ingresa el <b>reciboId</b> y el <b>motivo</b>. Esto marca el recibo como <b>CANCELADO</b> (no se elimina).
          </div>
        </div>

        <div className={s.countPill}>ADMIN / CAJA</div>
      </header>

      {c.error ? (
        <div className={s.error}>
          <AlertTriangle size={16} />
          <span>{c.error}</span>
        </div>
      ) : null}

      <form className={s.form} onSubmit={onSubmit}>
        <div className={s.formGrid}>
          <label className={s.field}>
            <span className={s.fieldLabel}>reciboId</span>
            <input
              className={s.input}
              inputMode="numeric"
              placeholder="Ej. 3"
              value={reciboIdText}
              onChange={(e) => setReciboIdText(e.target.value.replace(/[^\d]/g, ''))}
            />
            <span className={s.hint}>{reciboIdOk ? 'OK' : 'Debe ser un número > 0'}</span>
          </label>

          <label className={s.field}>
            <span className={s.fieldLabel}>motivo</span>
            <input
              className={s.input}
              placeholder="Ej. Pago duplicado, error de captura…"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
            <span className={s.hint}>{motivoOk ? 'OK' : 'Mínimo 3 caracteres'}</span>
          </label>
        </div>

        <div className={s.actions}>
          <button className={s.primaryBtn} type="submit" disabled={disabled} title="Cancelar recibo">
            <Ban size={16} />
            {c.loading ? 'Cancelando…' : 'Cancelar'}
          </button>

          <button className={s.iconBtn} type="button" onClick={c.reset} disabled={c.loading} title="Limpiar">
            ↺
          </button>
        </div>
      </form>

      {c.ok ? <Result r={c.ok} /> : null}
    </section>
  );
}
