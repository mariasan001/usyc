'use client';

import s from './AlumnoFiltersBar.module.css';
import { ESCOLARIDADES } from '../../constants/catalogos.constants';
import type { ID } from '../../types/alumnos.tipos';

export type AlumnoEstadoFilter = 'ALL' | 'ACTIVO' | 'POR_VENCER' | 'EGRESADO';

export type AlumnoFilters = {
  q: string;
  escolaridadId: ID | 'ALL';
  estado: AlumnoEstadoFilter;
  fechaIngresoDesde?: string;
  fechaIngresoHasta?: string;
};

export type AlumnoFiltersUpdater =
  | AlumnoFilters
  | ((prev: AlumnoFilters) => AlumnoFilters);

export default function AlumnoFiltersBar({
  filters,
  onChange,
  onRefresh,
}: {
  filters: AlumnoFilters;
  onChange: (next: AlumnoFiltersUpdater) => void;
  onRefresh: () => void;
}) {
  return (
    <div className={s.bar}>
      <input
        className={s.search}
        placeholder="Buscar por nombre o matrícula…"
        value={filters.q}
        onChange={(e) =>
          onChange((prev) => ({ ...prev, q: e.target.value }))
        }
      />

      <select
        className={s.select}
        value={filters.escolaridadId}
        onChange={(e) =>
          onChange((prev) => ({
            ...prev,
            escolaridadId: e.target.value as ID | 'ALL',
          }))
        }
      >
        <option value="ALL">Todas las escolaridades</option>
        {ESCOLARIDADES.map((x) => (
          <option key={x.id} value={x.id}>
            {x.nombre}
          </option>
        ))}
      </select>

      <select
        className={s.select}
        value={filters.estado}
        onChange={(e) =>
          onChange((prev) => ({
            ...prev,
            estado: e.target.value as AlumnoEstadoFilter,
          }))
        }
      >
        <option value="ALL">Todos los estados</option>
        <option value="ACTIVO">Activo</option>
        <option value="POR_VENCER">Por vencer</option>
        <option value="EGRESADO">Egresado</option>
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

      <button className={s.refresh} onClick={onRefresh} title="Refrescar">
        Refrescar
      </button>
    </div>
  );
}
