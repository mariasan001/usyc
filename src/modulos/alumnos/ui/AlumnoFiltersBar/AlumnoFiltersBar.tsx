'use client';

import { useMemo } from 'react';

import s from './AlumnoFiltersBar.module.css';
import { useEscolaridades, usePlanteles } from '@/modulos/configuraciones/hooks';

export type AlumnoFilters = {
  q: string;
  escolaridadId: number | 'ALL';
  plantelId: number | 'ALL';
  fechaIngresoDesde?: string;
  fechaIngresoHasta?: string;
};

export type AlumnoFiltersUpdater =
  | AlumnoFilters
  | ((prev: AlumnoFilters) => AlumnoFilters);

type Props = {
  filters: AlumnoFilters;
  onChange: (next: AlumnoFiltersUpdater) => void;
  onRefresh: () => void;
};

/** Soporta hooks que expongan `isLoading` o `loading` */
type LoadingShape = { isLoading?: boolean; loading?: boolean };

function getLoading(x: LoadingShape): boolean {
  if ('isLoading' in x && typeof x.isLoading === 'boolean') return x.isLoading;
  if ('loading' in x && typeof x.loading === 'boolean') return x.loading;
  return false;
}

export default function AlumnoFiltersBar({ filters, onChange, onRefresh }: Props) {
  const escolaridadesApi = useEscolaridades({ soloActivos: true });
  const plantelesApi = usePlanteles({ soloActivos: true });

  const escolaridadesLoading = getLoading(escolaridadesApi);
  const plantelesLoading = getLoading(plantelesApi);

  const escolaridadesOptions = useMemo(
    () =>
      (escolaridadesApi.items ?? []).map((e) => ({
        value: Number(e.id),
        label: e.nombre,
      })),
    [escolaridadesApi.items],
  );

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
      <input
        className={s.search}
        placeholder="Buscar por nombre o matrícula…"
        value={filters.q}
        onChange={(e) => onChange((prev) => ({ ...prev, q: e.target.value }))}
      />

      {/* Escolaridad */}
      <select
        className={s.select}
        value={String(filters.escolaridadId)}
        onChange={(e) => {
          const v = e.target.value;
          onChange((prev) => ({
            ...prev,
            escolaridadId: v === 'ALL' ? 'ALL' : Number(v),
          }));
        }}
        disabled={escolaridadesLoading}
      >
        <option value="ALL">
          {escolaridadesLoading ? 'Cargando escolaridades…' : 'Todas las escolaridades'}
        </option>

        {escolaridadesOptions.map((x) => (
          <option key={x.value} value={String(x.value)}>
            {x.label}
          </option>
        ))}
      </select>

      {/* Plantel */}
      <select
        className={s.select}
        value={String(filters.plantelId)}
        onChange={(e) => {
          const v = e.target.value;
          onChange((prev) => ({
            ...prev,
            plantelId: v === 'ALL' ? 'ALL' : Number(v),
          }));
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

      {/* Rango fecha ingreso */}
      <div className={s.dateWrap}>
        <input
          className={s.date}
          type="date"
          value={filters.fechaIngresoDesde ?? ''}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              fechaIngresoDesde: e.target.value || undefined,
            }))
          }
        />
        <span className={s.dateSep}>—</span>
        <input
          className={s.date}
          type="date"
          value={filters.fechaIngresoHasta ?? ''}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              fechaIngresoHasta: e.target.value || undefined,
            }))
          }
        />
      </div>

      <button className={s.refresh} onClick={onRefresh} type="button" title="Refrescar">
        Refrescar
      </button>
    </div>
  );
}
