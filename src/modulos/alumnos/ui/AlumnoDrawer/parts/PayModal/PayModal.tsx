'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import s from './PayModal.module.css';
import type { ProjectionRow } from '../../types/alumno-drawer.types';
import type { ReciboCreateDTO } from '../../types/recibos.types';
import type { PaymentMethod } from '../../types/alumno-drawer.types';

function todayISO() {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function isManualRequired(conceptCode: string) {
  // según swagger: si concepto es OTRO => montoManual requerido
  return conceptCode === 'OTRO';
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
  const [mounted, setMounted] = useState(false);

  const conceptCode = row?.conceptCode ?? '';
  const amountFromProjection = row?.amount ?? 0;

  // UI state
  const [dateISO, setDateISO] = useState<string>(todayISO());
  const [method, setMethod] = useState<PaymentMethod>('EFECTIVO');
  const [comentario, setComentario] = useState('');
  const [montoManual, setMontoManual] = useState<string>('');

  // Reset cada vez que se abre/cambia row
  useEffect(() => {
    if (!open) return;
    setDateISO(todayISO());
    setMethod('EFECTIVO');
    setComentario('');
    setMontoManual('');
  }, [open, row?.idx]);

  useEffect(() => setMounted(true), []);

  const helpText = useMemo(() => {
    if (!conceptCode) return '';
    return isManualRequired(conceptCode)
      ? 'Este concepto requiere un monto manual.'
      : 'Este concepto toma el monto desde la carrera.';
  }, [conceptCode]);

  const totalPreview = useMemo(() => {
    if (!conceptCode) return 0;
    if (isManualRequired(conceptCode)) {
      const n = Number(montoManual || 0);
      return Number.isFinite(n) ? n : 0;
    }
    return amountFromProjection;
  }, [conceptCode, amountFromProjection, montoManual]);

  if (!open) return null;
  if (!mounted) return null;

  const canSubmit = !!alumnoId && !!conceptCode && !!dateISO && totalPreview > 0;

  async function handleSave() {
    if (!row) return;

    const payload: ReciboCreateDTO = {
      alumnoId,
      concepto: row.conceptCode,
      fechaPago: dateISO,
      comentario: comentario.trim() ? comentario.trim() : undefined,
    };

    // ✅ regla swagger: montoManual solo si OTRO
    if (isManualRequired(row.conceptCode)) {
      payload.montoManual = Number(montoManual || 0);
    }

    // method se queda listo para futuro (no se manda aún)
    // payload.metodo = method;

    // 🔎 para debug rápido sin molestar al back:
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

              {isManualRequired(conceptCode) ? (
                <input
                  className={s.input}
                  value={montoManual}
                  onChange={(e) => setMontoManual(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                />
              ) : (
                <input className={s.input} value={amountFromProjection.toFixed(2)} readOnly />
              )}
            </div>

            <div className={s.field}>
              <label className={s.label}>Fecha</label>
              {/* IMPORTANTE: type="date" => YYYY-MM-DD */}
              <input
                className={s.input}
                type="date"
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
              />
            </div>

            <div className={s.field}>
              <label className={s.label}>Método</label>
              <select
                className={s.select}
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
              <div className={s.hint}>
                Aún no se envía al API (lo dejamos listo para cuando lo agreguen).
              </div>
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

          <button
            className={s.primaryBtn}
            onClick={handleSave}
            type="button"
            disabled={!canSubmit}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
