'use client';

import { useEffect, useMemo } from 'react';

import s from './ExtrasPanel.module.css';

import { useTiposPago } from '@/modulos/configuraciones/hooks/useTiposPago';
import type { TipoPago } from '@/modulos/configuraciones/types/tiposPago.types';

import { useConceptosPago } from '@/modulos/configuraciones/hooks/useConceptosPago';
import type { ConceptoPago } from '@/modulos/configuraciones/types/conceptosPago.types';

function todayISO() {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Normaliza el input de monto para guardarlo "crudo" (sin comas)
 * - Solo dígitos y un punto
 * - Máximo 2 decimales
 * Ej: "1,242.50" -> "1242.50"
 */
function normalizeMoneyRaw(v: string) {
  const cleaned = v.replace(/[^\d.]/g, '');

  const parts = cleaned.split('.');
  const intPart = parts[0] ?? '';
  const decPart = parts[1] ?? '';

  const dec2 = decPart.slice(0, 2);

  return parts.length > 1 ? `${intPart}.${dec2}` : intPart;
}

/**
 * Formatea visualmente con separador de miles (MX)
 * - Mantiene los decimales tal cual se van escribiendo
 */
function formatMoneyDisplay(raw: string) {
  if (!raw) return '';

  const [intRaw, decRaw] = raw.split('.');

  const intNum = Number(intRaw || '0');
  const intFormatted = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(
    Number.isFinite(intNum) ? intNum : 0,
  );

  if (raw.includes('.')) return `${intFormatted}.${decRaw ?? ''}`;
  return intFormatted;
}

function toNumber(v: string) {
  const cleaned = String(v ?? '').replace(/,/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export default function ExtrasPanel({
  extraConceptoId,
  setExtraConceptoId,

  extraAmount,
  setExtraAmount,

  extraDate,
  setExtraDate,

  extraTipoPagoId,
  setExtraTipoPagoId,

  onAddExtra,
  submitting,
}: {
  extraConceptoId: number;
  setExtraConceptoId: (v: number) => void;

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
  const conceptos = useConceptosPago({ soloActivos: true });

  // ✅ default tipoPagoId: primer activo
  useEffect(() => {
    if (extraTipoPagoId > 0) return;
    const first = tiposPago.items?.[0];
    if (typeof first?.id === 'number') setExtraTipoPagoId(first.id);
  }, [extraTipoPagoId, tiposPago.items, setExtraTipoPagoId]);

  // ✅ default conceptoId: primer activo
  useEffect(() => {
    if (extraConceptoId > 0) return;
    const first = conceptos.items?.[0];
    if (typeof first?.conceptoId === 'number') setExtraConceptoId(first.conceptoId);
  }, [extraConceptoId, conceptos.items, setExtraConceptoId]);

  const amountNum = useMemo(() => toNumber(extraAmount), [extraAmount]);

  const conceptOk = extraConceptoId > 0;
  const amountOk = Number.isFinite(amountNum) && amountNum > 0;
  const dateOk = !!extraDate;
  const tipoOk = extraTipoPagoId > 0;

  const canSubmit =
    conceptOk &&
    amountOk &&
    dateOk &&
    tipoOk &&
    !tiposPago.isLoading &&
    !conceptos.isLoading &&
    !submitting;

  const tipoPagoLabel = useMemo(() => {
    const found = (tiposPago.items ?? []).find((x: TipoPago) => x.id === extraTipoPagoId);
    return found ? `${found.name} (${found.code})` : '';
  }, [tiposPago.items, extraTipoPagoId]);

  const conceptoLabel = useMemo(() => {
    const found = (conceptos.items ?? []).find((c: ConceptoPago) => c.conceptoId === extraConceptoId);
    return found ? `${found.nombre} (${found.codigo})` : '';
  }, [conceptos.items, extraConceptoId]);

  return (
    <section className={s.panel}>
      <div className={s.panelTitleRow}>
        <div className={s.panelTitle}>Pagos extra</div>
        <div className={s.panelHint}>Cursos, constancias, materiales, etc.</div>
      </div>

      <div className={s.grid}>
        {/* ✅ CONCEPTO (CATÁLOGO) */}
        <div className={s.formRow}>
          <label className={s.label}>Concepto</label>

          <select
            className={`${s.select} ${!conceptOk ? s.inputInvalid : ''}`}
            value={String(extraConceptoId || 0)}
            onChange={(e) => setExtraConceptoId(Number(e.target.value))}
            disabled={conceptos.isLoading || (conceptos.items?.length ?? 0) === 0}
          >
            {conceptos.isLoading ? (
              <option value="0">Cargando conceptos…</option>
            ) : (conceptos.items?.length ?? 0) === 0 ? (
              <option value="0">No hay conceptos activos</option>
            ) : (
              <>
                <option value="0">Selecciona…</option>
                {(conceptos.items ?? []).map((c) => (
                  <option key={c.conceptoId} value={c.conceptoId}>
                    {c.nombre} ({c.codigo})
                  </option>
                ))}
              </>
            )}
          </select>

          {conceptoLabel ? (
            <div className={s.fieldHint}>Seleccionado: {conceptoLabel}</div>
          ) : !conceptOk ? (
            <div className={s.fieldHint}>Selecciona un concepto.</div>
          ) : null}
        </div>

        {/* MONTO */}
        <div className={s.formRow}>
          <label className={s.label}>Monto</label>
          <input
            className={`${s.input} ${!amountOk && extraAmount ? s.inputInvalid : ''}`}
            value={formatMoneyDisplay(extraAmount)}
            onChange={(e) => {
              const raw = normalizeMoneyRaw(e.target.value);
              setExtraAmount(raw);
            }}
            inputMode="decimal"
            placeholder="0.00"
          />
          {!amountOk && extraAmount ? (
            <div className={s.fieldHint}>Ingresa un monto mayor a 0.</div>
          ) : null}
        </div>

        {/* FECHA */}
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

        {/* TIPO DE PAGO */}
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

          {tipoPagoLabel ? <div className={s.fieldHint}>Seleccionado: {tipoPagoLabel}</div> : null}
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
