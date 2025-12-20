'use client';

import { useEffect, useMemo } from 'react';

import s from './ExtrasPanel.module.css';

import { useTiposPago } from '@/modulos/configuraciones/hooks/useTiposPago';
import type { TipoPago } from '@/modulos/configuraciones/types/tiposPago.types';

function todayISO() {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function normalizeMoneyInput(v: string) {
  const cleaned = v.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join('')}`;
}

function toNumber(v: string) {
  const cleaned = String(v ?? '').replace(/,/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export default function ExtrasPanel({
  extraConcept,
  setExtraConcept,

  extraAmount,
  setExtraAmount,

  extraDate,
  setExtraDate,

  extraTipoPagoId,
  setExtraTipoPagoId,

  onAddExtra,
  submitting,
}: {
  extraConcept: string;
  setExtraConcept: (v: string) => void;

  extraAmount: string;
  setExtraAmount: (v: string) => void;

  extraDate: string;
  setExtraDate: (v: string) => void;

  extraTipoPagoId: number;
  setExtraTipoPagoId: (v: number) => void;

  onAddExtra: () => void;

  submitting?: boolean;
}) {
  const tiposPago = useTiposPago({ soloActivos: true });

  // ✅ default tipoPagoId: primer activo
  useEffect(() => {
    if (extraTipoPagoId > 0) return;
    const first = tiposPago.items?.[0];
    if (typeof first?.id === 'number') setExtraTipoPagoId(first.id);
  }, [extraTipoPagoId, tiposPago.items, setExtraTipoPagoId]);

  const amountNum = useMemo(() => toNumber(extraAmount), [extraAmount]);

  const conceptOk = extraConcept.trim().length >= 3;
  const amountOk = Number.isFinite(amountNum) && amountNum > 0;
  const dateOk = !!extraDate;
  const tipoOk = extraTipoPagoId > 0;

  const canSubmit =
    conceptOk &&
    amountOk &&
    dateOk &&
    tipoOk &&
    !tiposPago.isLoading &&
    !submitting;

  const tipoPagoLabel = useMemo(() => {
    const found = (tiposPago.items ?? []).find((x: TipoPago) => x.id === extraTipoPagoId);
    return found ? `${found.name} (${found.code})` : '';
  }, [tiposPago.items, extraTipoPagoId]);

  return (
    <section className={s.panel}>
      <div className={s.panelTitleRow}>
        <div className={s.panelTitle}>Pagos extra</div>
        <div className={s.panelHint}>Cursos, constancias, materiales, etc.</div>
      </div>

      <div className={s.grid}>
        <div className={s.formRow}>
          <label className={s.label}>Concepto</label>
          <input
            className={`${s.input} ${!conceptOk && extraConcept ? s.inputInvalid : ''}`}
            value={extraConcept}
            onChange={(e) => setExtraConcept(e.target.value)}
            placeholder="Ej. Curso de verano"
            maxLength={80}
          />
          {!conceptOk && extraConcept ? (
            <div className={s.fieldHint}>Escribe un concepto más claro (mín. 3 letras).</div>
          ) : null}
        </div>

        <div className={s.formRow}>
          <label className={s.label}>Monto</label>
          <input
            className={`${s.input} ${!amountOk && extraAmount ? s.inputInvalid : ''}`}
            value={extraAmount}
            onChange={(e) => setExtraAmount(normalizeMoneyInput(e.target.value))}
            inputMode="decimal"
            placeholder="0.00"
          />
          {!amountOk && extraAmount ? (
            <div className={s.fieldHint}>Ingresa un monto mayor a 0.</div>
          ) : null}
        </div>

        <div className={s.formRow}>
          <label className={s.label}>Fecha</label>
          <input
            className={s.input}
            type="date"
            value={extraDate}
            onChange={(e) => setExtraDate(e.target.value)}
            max={todayISO()}
          />
          {!dateOk ? <div className={s.fieldHint}>Selecciona la fecha del pago.</div> : null}
        </div>

        <div className={s.formRow}>
          <label className={s.label}>Tipo de pago</label>
          <select
            className={`${s.select} ${!tipoOk ? s.inputInvalid : ''}`}
            value={String(extraTipoPagoId || 0)}
            onChange={(e) => setExtraTipoPagoId(Number(e.target.value))}
            disabled={tiposPago.isLoading || (tiposPago.items?.length ?? 0) === 0}
          >
            {tiposPago.isLoading ? (
              <option value="0">Cargando tipos de pago…</option>
            ) : (tiposPago.items?.length ?? 0) === 0 ? (
              <option value="0">No hay tipos de pago activos</option>
            ) : (
              <>
                <option value="0">Selecciona…</option>
                {(tiposPago.items ?? []).map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.name} ({tp.code})
                  </option>
                ))}
              </>
            )}
          </select>

          {tipoPagoLabel ? (
            <div className={s.fieldHint}>Seleccionado: {tipoPagoLabel}</div>
          ) : null}
        </div>
      </div>

      <button
        className={s.primaryBtn}
        onClick={onAddExtra}
        type="button"
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
      >
        {submitting ? 'Registrando…' : 'Agregar pago extra'}
      </button>

      <div className={s.smallHint}>
        Los extras se suman al historial y generan recibo (con QR) como cualquier pago.
      </div>
    </section>
  );
}
