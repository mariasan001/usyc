'use client';

import { PaymentMethod } from '../../types/alumno-drawer.types';
import s from './ExtrasPanel.module.css';

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
            className={s.input}
            value={extraConcept}
            onChange={(e) => setExtraConcept(e.target.value)}
            placeholder="Ej. Curso de verano"
          />
        </div>

        <div className={s.formRow}>
          <label className={s.label}>Monto</label>
          <input
            className={s.input}
            value={extraAmount}
            onChange={(e) => setExtraAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0"
          />
        </div>

        <div className={s.formRow}>
          <label className={s.label}>Fecha</label>
          <input
            className={s.input}
            type="date"
            value={extraDate}
            onChange={(e) => setExtraDate(e.target.value)}
          />
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

      <button className={s.primaryBtn} onClick={onAddExtra} type="button">
        Agregar pago extra
      </button>

      <div className={s.smallHint}>
        Los extras se suman al total del plan y afectan el saldo automáticamente.
      </div>
    </section>
  );
}
