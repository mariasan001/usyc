'use client';

import { useMemo } from 'react';

import s from './AlumnoFiltersBar.module.css';
import { useEscolaridades } from '@/modulos/configuraciones/hooks';

export type AlumnoFilters = {
  q: string;
  escolaridadId: number | 'ALL';
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

/**
 * Barra de filtros: Directorio de alumnos
 * - Búsqueda por nombre o matrícula
 * - Filtro por escolaridad (API)
 * - Rango de fecha de ingreso
 * - Botón Refrescar
 *
 * Nota:
 * - Aquí NO hacemos debounce. Debounce debe vivir en el hook que consulta (useAlumnos),
 *   para evitar problemas de renders y mantener UI simple.
 */
export default function AlumnoFiltersBar({ filters, onChange, onRefresh }: Props) {
  const escolaridadesApi = useEscolaridades({ soloActivos: true });

  const escolaridadesOptions = useMemo(() => {
    return (escolaridadesApi.items ?? []).map((e) => ({
      value: e.id,
      label: e.nombre,
    }));
  }, [escolaridadesApi.items]);

  return (
    <div className={s.bar}>
      <input
        className={s.search}
        placeholder="Buscar por nombre o matrícula…"
        value={filters.q}
        onChange={(e) => onChange((prev) => ({ ...prev, q: e.target.value }))}
      />

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
        disabled={escolaridadesApi.isLoading}
      >
        <option value="ALL">
          {escolaridadesApi.isLoading ? 'Cargando escolaridades…' : 'Todas las escolaridades'}
        </option>

        {escolaridadesOptions.map((x) => (
          <option key={x.value} value={String(x.value)}>
            {x.label}
          </option>
        ))}
      </select>

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
