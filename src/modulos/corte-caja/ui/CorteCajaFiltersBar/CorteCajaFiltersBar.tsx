'use client';

import { useMemo } from 'react';
import s from './CorteCajaFiltersBar.module.css';

import { usePlanteles } from '@/modulos/configuraciones/hooks';

export type CorteCajaFiltersUI = {
  fecha: string;
  plantelId: number | null; // null = ALL (solo admin)
  q: string;
};

type Updater = CorteCajaFiltersUI | ((prev: CorteCajaFiltersUI) => CorteCajaFiltersUI);

type Props = {
  filters: CorteCajaFiltersUI;
  onChange: (next: Updater) => void;
  onRefresh: () => void;
  loading?: boolean;

  // ✅ regla por rol
  esAdmin: boolean;
  plantelUsuarioId: number | null;
  plantelUsuarioNombre: string | null;
};

/** Soporta hooks que expongan `isLoading` o `loading` */
type LoadingShape = { isLoading?: boolean; loading?: boolean };

function getLoading(x: LoadingShape): boolean {
  if ('isLoading' in x && typeof x.isLoading === 'boolean') return x.isLoading;
  if ('loading' in x && typeof x.loading === 'boolean') return x.loading;
  return false;
}

export default function CorteCajaFiltersBar({
  filters,
  onChange,
  onRefresh,
  loading,

  esAdmin,
  plantelUsuarioId,
  plantelUsuarioNombre,
}: Props) {
  const plantelesApi = usePlanteles({ soloActivos: true });

  // ✅ aquí está el fix real: ya no usamos plantelesApi.isLoading directo
  const plantelesLoading = getLoading(plantelesApi);

  const plantelesOptions = useMemo(
    () =>
      (plantelesApi.items ?? []).map((p) => ({
        value: Number(p.id),
        label: p.name,
      })),
    [plantelesApi.items],
  );

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

        {/* ✅ Plantel */}
        <label className={s.field}>
          <span className={s.label}>Plantel</span>

          {esAdmin ? (
            <select
              className={s.input}
              value={filters.plantelId == null ? 'ALL' : String(filters.plantelId)}
              onChange={(e) => {
                const v = e.target.value;
                onChange((prev) => ({ ...prev, plantelId: v === 'ALL' ? null : Number(v) }));
              }}
              disabled={plantelesLoading}
            >
              <option value="ALL">
                {plantelesLoading ? 'Cargando planteles…' : 'Todos los planteles'}
              </option>

              {plantelesOptions.map((x) => (
                <option key={x.value} value={String(x.value)}>
                  {x.label}
                </option>
              ))}
            </select>
          ) : (
            <select className={s.input} value={String(plantelUsuarioId ?? '')} disabled>
              <option value={String(plantelUsuarioId ?? '')}>
                {plantelUsuarioNombre ?? 'Plantel asignado'}
              </option>
            </select>
          )}
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
