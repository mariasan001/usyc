'use client';

import { useEffect, useMemo, useState } from 'react';
import s from './PayModal.module.css';

import type { ProjectionRow, PaymentMethod } from '../../types/alumno-drawer.types';

type PayPayload = {
  alumnoId: string;
  concepto: string;
  montoManual?: number;
  fechaPago: string; // YYYY-MM-DD
  comentario?: string;
  // metodo?: PaymentMethod; // listo para futuro (cuando el back lo acepte)
};

function todayISO() {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toNumberSafe(v: string): number | null {
  const x = Number(String(v).replace(',', '.'));
  if (!Number.isFinite(x)) return null;
  return x;
}

export default function PayModal({
  open,
  row,
  alumnoId,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  row: ProjectionRow | null;
  alumnoId: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: PayPayload) => Promise<void>;
}) {
  // si no está abierto o no hay fila, no renderizamos nada (modal real)
  const visible = open && !!row;
  const conceptCode = row?.conceptCode ?? '';
  const amount = row?.amount ?? 0;

  // state del formulario
  const [fechaPago, setFechaPago] = useState(todayISO());
  const [metodo, setMetodo] = useState<PaymentMethod>('EFECTIVO');
  const [comentario, setComentario] = useState('');
  const [montoManual, setMontoManual] = useState<string>(''); // solo si en futuro aplica
  const [localError, setLocalError] = useState<string | null>(null);

  // si cambia la fila (clic en otra mensualidad), reseteamos valores coherentes
  useEffect(() => {
    if (!visible) return;
    setFechaPago(todayISO());
    setMetodo('EFECTIVO');
    setComentario('');
    setMontoManual('');
    setLocalError(null);
  }, [visible, row?.idx, row?.periodo, row?.dueDate, row?.conceptCode]);

  // Reglas UX (según swagger que mostraste):
  // - Si concepto es INSCRIPCION o MENSUALIDAD, el monto lo toma de carrera -> no requiere montoManual
  // - Si es OTRO, pedir montoManual (lo dejamos listo aunque hoy no se use)
  const requiresManualAmount = useMemo(() => {
    const c = conceptCode?.toUpperCase().trim();
    return c !== 'INSCRIPCION' && c !== 'MENSUALIDAD';
  }, [conceptCode]);

  // Nota: en tu captura, igual se ve monto fijo siempre; aquí lo dejamos editable solo si OTRO.
  const shownAmount = requiresManualAmount
    ? (toNumberSafe(montoManual) ?? 0)
    : amount;

  if (!visible) return null;

  async function handleSave() {
    setLocalError(null);

    if (!alumnoId) {
      setLocalError('Falta alumnoId.');
      return;
    }
    if (!conceptCode) {
      setLocalError('Falta concepto.');
      return;
    }
    if (!fechaPago) {
      setLocalError('Selecciona fecha de pago.');
      return;
    }

    if (requiresManualAmount) {
      const n = toNumberSafe(montoManual);
      if (n === null || n <= 0) {
        setLocalError('Captura un monto válido (mayor a 0).');
        return;
      }
    }

    const payload: PayPayload = {
      alumnoId,
      concepto: conceptCode,
      fechaPago,
      comentario: comentario?.trim() || undefined,
      ...(requiresManualAmount
        ? { montoManual: toNumberSafe(montoManual) ?? undefined }
        : {}),
      // metodo, // 🔜 futuro
    };

    await onSubmit(payload);
  }

  return (
    <div
      className={s.backdrop}
      onMouseDown={() => {
        if (saving) return;
        onClose();
      }}
      role="presentation"
    >
      <div
        className={s.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Registrar pago"
      >
        <header className={s.header}>
          <div>
            <div className={s.title}>Registrar pago</div>
            <div className={s.subtitle}>Se generará un recibo y quedará en historial.</div>
          </div>

          <button
            className={s.closeBtn}
            type="button"
            onClick={onClose}
            disabled={!!saving}
            aria-label="Cerrar"
            title="Cerrar"
          >
            ×
          </button>
        </header>

        <div className={s.body}>
          {localError ? <div className={s.alertError}>{localError}</div> : null}

          <div className={s.grid}>
            <div className={s.formRow}>
              <label className={s.label}>Concepto</label>
              <input className={s.input} value={conceptCode} readOnly />
              <div className={s.hint}>
                {requiresManualAmount
                  ? 'Este concepto requiere monto manual.'
                  : 'Este concepto toma el monto desde la carrera.'}
              </div>
            </div>

            <div className={s.formRow}>
              <label className={s.label}>Monto</label>

              {requiresManualAmount ? (
                <input
                  className={s.input}
                  value={montoManual}
                  onChange={(e) => setMontoManual(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                />
              ) : (
                <input className={s.input} value={amount.toFixed(2)} readOnly />
              )}
            </div>

            <div className={s.formRow}>
              <label className={s.label}>Fecha</label>
              <input
                className={s.input}
                type="date"
                value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
              />
            </div>

            <div className={s.formRow}>
              <label className={s.label}>Método</label>
              <select
                className={s.select}
                value={metodo}
                onChange={(e) => setMetodo(e.target.value as PaymentMethod)}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>

              <div className={s.hint}>
                Aún no se envía al API (lo dejamos listo para cuando lo agreguen).
              </div>
            </div>

            <div className={s.formRowFull}>
              <label className={s.label}>Comentario</label>
              <textarea
                className={s.textarea}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Opcional…"
              />
            </div>
          </div>

          <div className={s.previewRow}>
            <span className={s.previewLabel}>Total a registrar</span>
            <b className={s.previewValue}>${shownAmount.toFixed(2)}</b>
          </div>
        </div>

        <footer className={s.footer}>
          <button
            className={s.ghostBtn}
            type="button"
            onClick={onClose}
            disabled={!!saving}
          >
            Cancelar
          </button>

          <button
            className={s.primaryBtn}
            type="button"
            onClick={handleSave}
            disabled={!!saving}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </footer>
      </div>
    </div>
  );
}
