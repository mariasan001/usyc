'use client';

import s from './AlumnosTableCard.module.css';

import type { Alumno, ID } from '../../types/alumnos.tipos';
import AlumnoFiltersBar, { type AlumnoFilters, type AlumnoFiltersUpdater } from '../AlumnoFiltersBar/AlumnoFiltersBar';
import AlumnoRow from '../AlumnoRow/AlumnoRow';

export default function AlumnosTableCard({
  items,
  loading,
  error,
  total,
  filters,
  onChangeFilters,
  onOpen,
  onRefresh,
}: {
  items: Alumno[];
  loading: boolean;
  error: string | null;
  total: number;

  filters: AlumnoFilters;
  onChangeFilters: (next: AlumnoFiltersUpdater) => void;

  onOpen: (id: ID) => void;
  onRefresh: () => void;
}) {
  const hasRows = !loading && items.length > 0;

  return (
    <section className={s.card}>
      <header className={s.header}>
        <div className={s.headText}>
          <h2 className={s.title}>Directorio</h2>
          <p className={s.subtitle}>Busca, filtra y abre detalle.</p>
        </div>

        <div className={s.badge} aria-label="Total de alumnos">
          <span className={s.badgeNum}>{total}</span>
          <span className={s.badgeTxt}>alumnos</span>
        </div>
      </header>

      <AlumnoFiltersBar filters={filters} onChange={onChangeFilters} onRefresh={onRefresh} />

      {error ? <div className={s.alertError}>{error}</div> : null}

      <div className={s.tableWrap}>
        {/* ✅ Head fijo (no se scrollea) */}
        <div className={s.tableHead}>
          <div>Alumno</div>
          <div>Escolaridad</div>
          <div>Carrera</div>
          <div>Ingreso</div>
          <div>Término</div>
          <div>Estado</div>
          <div className={s.actionsCol}>Acciones</div>
        </div>

        {/* ✅ Scroll SOLO del body */}
        <div className={s.tableBodyScroll} role="region" aria-label="Tabla de alumnos">
          {loading ? (
            <div className={s.loading}>Cargando…</div>
          ) : items.length === 0 ? (
            <div className={s.empty}>No hay resultados con esos filtros.</div>
          ) : (
            <div className={s.body}>
              {items.map((a) => (
                <AlumnoRow key={a.id} alumno={a} onOpen={() => onOpen(a.id)} />
              ))}

              {/* ✅ relleno sutil para que no se vea “cortada” cuando hay pocas filas */}
              {hasRows ? <div className={s.bottomPad} /> : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
