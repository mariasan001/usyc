'use client';

import s from './HistoricoFiltersBar.module.css';

type Filters = { q: string };
type Updater = Filters | ((prev: Filters) => Filters);

export default function HistoricoFiltersBar({
  filters,
  onChange,
  onRefresh,
  loading,
}: {
  filters: Filters;
  onChange: (next: Updater) => void;
  onRefresh: () => void;
  loading?: boolean;
}) {
  return (
    <div className={s.bar}>
      <input
        className={s.search}
        placeholder="Buscar por folio, alumno, concepto, estatus…"
        value={filters.q}
        onChange={(e) => onChange((prev) => ({ ...prev, q: e.target.value }))}
      />

      <button className={s.refresh} onClick={onRefresh} type="button" disabled={!!loading}>
        {loading ? 'Cargando…' : 'Refrescar'}
      </button>
    </div>
  );
}
