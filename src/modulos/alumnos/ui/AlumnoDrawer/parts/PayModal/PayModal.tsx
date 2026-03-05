'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import s from './PayModal.module.css';
import type { ProjectionRow } from '../../types/alumno-drawer.types';
import type { ReciboCreateDTO } from '../../types/recibos.types';

import { useTiposPago } from '@/modulos/configuraciones/hooks/useTiposPago';
import type { TipoPago } from '@/modulos/configuraciones/types/tiposPago.types';

function todayISO() {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toMoneyNumber(v: string) {
  const cleaned = String(v ?? '').replace(/,/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function moneyToInputValue(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

export default function PayModal({
  open,
  row,
  alumnoId,
  onClose,
  onSubmit,
}: {
  open: boolean;
  row: ProjectionRow | null;
  alumnoId: string;
  onClose: () => void;
  onSubmit: (payload: ReciboCreateDTO) => Promise<void>;
}) {
  // ✅ Hooks SIEMPRE (sin returns antes)
  const [mounted, setMounted] = useState(false);

  const tiposPago = useTiposPago({ soloActivos: true });

  const conceptCode = row?.conceptCode ?? '';
  const amountFromProjection = row?.amount ?? 0;

  const [dateISO, setDateISO] = useState<string>(todayISO());
  const [comentario, setComentario] = useState('');

  /**
   * ✅ NUEVO:
   * - El monto SIEMPRE es editable (por si un alumno tiene un monto distinto).
   * - Se autocompleta con el monto de la proyección cuando se abre el modal o cambia la fila.
   * - No rompe la lógica porque el backend seguirá validando según concepto/reglas.
   */
  const [montoEditable, setMontoEditable] = useState<string>('');

  const [tipoPagoId, setTipoPagoId] = useState<number>(0);

  useEffect(() => setMounted(true), []);

  // Reset al abrir / cambiar fila
  useEffect(() => {
    if (!open) return;

    setDateISO(todayISO());
    setComentario('');

    // ✅ Autocomplete: trae monto de la proyección, pero editable
    setMontoEditable(moneyToInputValue(amountFromProjection));

    // default tipo pago (si existe)
    const first = tiposPago.items?.[0];
    setTipoPagoId(typeof first?.id === 'number' ? first.id : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, row?.idx]);

  // Si tiposPago carga después, elige el primero si aún no hay selección
  useEffect(() => {
    if (!open) return;
    if (tipoPagoId) return;

    const first = tiposPago.items?.[0];
    if (typeof first?.id === 'number') setTipoPagoId(first.id);
  }, [open, tipoPagoId, tiposPago.items]);

  const helpText = useMemo(() => {
    if (!conceptCode) return '';
    return 'El monto se autocompleta, pero puedes ajustarlo si este alumno tiene un importe distinto.';
  }, [conceptCode]);

  const totalPreview = useMemo(() => {
    if (!conceptCode) return 0;
    return toMoneyNumber(montoEditable);
  }, [conceptCode, montoEditable]);

  const tipoPagoLabel = useMemo(() => {
    const found = (tiposPago.items ?? []).find((x: TipoPago) => x.id === tipoPagoId);
    return found ? `${found.name} (${found.code})` : '';
  }, [tiposPago.items, tipoPagoId]);

  // ✅ returns hasta el final (no rompe orden de hooks)
  if (!open) return null;
  if (!mounted) return null;

  const canSubmit =
    !!alumnoId &&
    !!conceptCode &&
    !!dateISO &&
    totalPreview > 0 &&
    tipoPagoId > 0 &&
    !tiposPago.isLoading;

  async function handleSave() {
    if (!row) return;

    /**
     * ✅ FIX TS:
     * Tu ReciboCreateDTO exige montoManual: number
     * entonces aquí SIEMPRE lo mandamos (nunca undefined).
     */
    const payload: ReciboCreateDTO = {
      alumnoId,
      concepto: row.conceptCode,
      montoManual: totalPreview, // ✅ siempre number
      fechaPago: dateISO,
      tipoPagoId,
      comentario: comentario.trim() ? comentario.trim() : undefined,
    };

    console.log('[PayModal] payload /api/recibos =>', payload);
    await onSubmit(payload);
  }

  return createPortal(
    <div className={s.backdrop} role="presentation" onMouseDown={onClose}>
      <div
        className={s.modal}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={s.header}>
          <div>
            <div className={s.title}>Registrar pago</div>
            <div className={s.subtitle}>Se generará un recibo y quedará en historial.</div>
          </div>

          <button className={s.iconBtn} onClick={onClose} type="button" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className={s.body}>
          <div className={s.grid}>
            <div className={s.field}>
              <label className={s.label}>Concepto</label>
              <input className={s.input} value={conceptCode} readOnly />
              <div className={s.hint}>{helpText}</div>
            </div>

            <div className={s.field}>
              <label className={s.label}>Monto</label>
              <input
                className={s.input}
                value={montoEditable}
                onChange={(e) => setMontoEditable(e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
              />
            </div>

            <div className={s.field}>
              <label className={s.label}>Fecha</label>
              <input
                className={s.input}
                type="date"
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
              />
            </div>

            <div className={s.field}>
              <label className={s.label}>Tipo de pago</label>
              <select
                className={s.select}
                value={String(tipoPagoId)}
                onChange={(e) => setTipoPagoId(Number(e.target.value))}
                disabled={tiposPago.isLoading || (tiposPago.items?.length ?? 0) === 0}
              >
                {tiposPago.isLoading ? (
                  <option value="0">Cargando tipos de pago…</option>
                ) : (tiposPago.items?.length ?? 0) === 0 ? (
                  <option value="0">No hay tipos de pago activos</option>
                ) : (
                  (tiposPago.items ?? []).map((tp) => (
                    <option key={tp.id} value={tp.id}>
                      {tp.name} ({tp.code})
                    </option>
                  ))
                )}
              </select>

              {tipoPagoLabel ? <div className={s.hint}>Seleccionado: {tipoPagoLabel}</div> : null}
            </div>

            <div className={s.fieldWide}>
              <label className={s.label}>Comentario</label>
              <textarea
                className={s.textarea}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Opcional"
              />
            </div>

            <div className={s.totalRow}>
              <div className={s.totalLabel}>Total a registrar</div>
              <div className={s.totalValue}>${totalPreview.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className={s.footer}>
          <button className={s.ghostBtn} onClick={onClose} type="button">
            Cancelar
          </button>

          <button className={s.primaryBtn} onClick={handleSave} type="button" disabled={!canSubmit}>
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}