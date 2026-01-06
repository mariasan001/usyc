// src/modulos/corte-caja/ui/CorteCajaFiltersBar/CorteCajaFiltersBar.tsx
'use client';

import s from './CorteCajaFiltersBar.module.css';

export type CorteCajaFiltersUI = {
  fecha: string;
  plantelId: number | null;
  q: string;
};

type Updater = CorteCajaFiltersUI | ((prev: CorteCajaFiltersUI) => CorteCajaFiltersUI);

function asIntOrNull(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export default function CorteCajaFiltersBar({
  filters,
  onChange,
  onRefresh,
  loading,
}: {
  filters: CorteCajaFiltersUI;
  onChange: (next: Updater) => void;
  onRefresh: () => void;
  loading?: boolean;
}) {
  return (
    <div className={s.bar}>
      <div className={s.left}>
        <label className={s.field}>
          <span className={s.label}>Fecha</span>
          <input
            className={s.input}
            type="date"
            value={filters.fecha}
            onChange={(e) => onChange((prev) => ({ ...prev, fecha: e.target.value }))}
          />
        </label>

        <label className={s.field}>
          <span className={s.label}>Plantel</span>
          <input
            className={s.input}
            inputMode="numeric"
            placeholder="Opcional"
            value={filters.plantelId ?? ''}
            onChange={(e) => onChange((prev) => ({ ...prev, plantelId: asIntOrNull(e.target.value) }))}
          />
        </label>

        <label className={s.fieldWide}>
          <span className={s.label}>Buscar</span>
          <input
            className={s.input}
            placeholder="Folio, alumno, concepto, estatus, tipo…"
            value={filters.q}
            onChange={(e) => onChange((prev) => ({ ...prev, q: e.target.value }))}
          />
        </label>
      </div>

      <div className={s.right}>
        <button className={s.refresh} onClick={onRefresh} type="button" disabled={!!loading}>
          {loading ? 'Cargando…' : 'Refrescar'}
        </button>
      </div>
    </div>
  );
}
