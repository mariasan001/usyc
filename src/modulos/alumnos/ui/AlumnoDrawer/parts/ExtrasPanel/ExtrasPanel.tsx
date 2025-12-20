'use client';

import { useMemo } from 'react';
import type { PaymentMethod } from '../../types/alumno-drawer.types';
import s from './ExtrasPanel.module.css';

function todayISO() {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function normalizeMoneyInput(v: string) {
  // deja solo números y punto, y evita múltiples puntos
  const cleaned = v.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join('')}`;
}

function toNumber(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export default function ExtrasPanel({
  extraConcept,
  setExtraConcept,
  extraAmount,
  setExtraAmount,
  extraDate,
  setExtraDate,
  extraMethod,
  setExtraMethod,
  onAddExtra,
}: {
  extraConcept: string;
  setExtraConcept: (v: string) => void;

  extraAmount: string;
  setExtraAmount: (v: string) => void;

  extraDate: string;
  setExtraDate: (v: string) => void;

  extraMethod: PaymentMethod;
  setExtraMethod: (v: PaymentMethod) => void;

  onAddExtra: () => void;
}) {
  const amountNum = useMemo(() => toNumber(extraAmount), [extraAmount]);

  const conceptOk = extraConcept.trim().length >= 3;
  const amountOk = Number.isFinite(amountNum) && amountNum > 0;
  const dateOk = !!extraDate;
  const canSubmit = conceptOk && amountOk && dateOk;

  return (
    <section className={s.panel}>
      <div className={s.panelTitleRow}>
        <div className={s.panelTitle}>Pagos extra</div>
        <div className={s.panelHint}>Cursos, conferencias, materiales, etc.</div>
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
          {!dateOk ? (
            <div className={s.fieldHint}>Selecciona la fecha del pago.</div>
          ) : null}
        </div>

        <div className={s.formRow}>
          <label className={s.label}>Método</label>
          <select
            className={s.select}
            value={extraMethod}
            onChange={(e) => setExtraMethod(e.target.value as PaymentMethod)}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>
      </div>

      <button
        className={s.primaryBtn}
        onClick={onAddExtra}
        type="button"
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
      >
        Agregar pago extra
      </button>

      <div className={s.smallHint}>
        Los extras se suman al total del plan y afectan el saldo automáticamente.
      </div>
    </section>
  );
}
