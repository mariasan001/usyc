// src/modulos/alumnos/ui/AlumnosTableCard/AlumnosTableCard.tsx
'use client';

import s from './AlumnosTableCard.module.css';

import type { Alumno, Page } from '../../types/alumno.types';
import AlumnoFiltersBar, {
  type AlumnoFilters,
  type AlumnoFiltersUpdater,
} from '../AlumnoFiltersBar/AlumnoFiltersBar';
import AlumnoRow from '../AlumnoRow/AlumnoRow';

type Props = {
  pageData: Page<Alumno> | null;
  loading: boolean;
  error: string | null;

  filters: AlumnoFilters;
  onChangeFilters: (next: AlumnoFiltersUpdater) => void;

  onOpen: (alumnoId: string) => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
};

/**
 * Card: Directorio de alumnos
 * - UI/composición: NO calcula término aquí.
 * - Tabla: header fijo + body scrolleable.
 * - Paginación: simple (prev/next).
 *
 * Nota:
 * - “Término” se calcula en `AlumnoRow` porque depende de duración de carrera/programa.
 */
export default function AlumnosTableCard({
  pageData,
  loading,
  error,
  filters,
  onChangeFilters,
  onOpen,
  onRefresh,
  onPageChange,
}: Props) {
  const items = pageData?.content ?? [];
  const total = pageData?.totalElements ?? 0;
  const page = pageData?.number ?? 0;
  const totalPages = pageData?.totalPages ?? 1;

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
        {/* Header fijo */}
        <div className={s.tableHead}>
          <div>Alumno</div>
          <div>Escolaridad</div>
          <div>Programa</div>
          <div>Ingreso</div>
          <div>Término</div>
          <div>Estado</div>
          <div className={s.actionsCol}>Acciones</div>
        </div>

        {/* Body con scroll */}
        <div className={s.tableBodyScroll} role="region" aria-label="Tabla de alumnos">
          {loading ? (
            <div className={s.loading}>Cargando…</div>
          ) : items.length === 0 ? (
            <div className={s.empty}>No hay resultados con esos filtros.</div>
          ) : (
            <div className={s.body}>
              {items.map((a) => (
                <AlumnoRow key={a.alumnoId} alumno={a} onOpen={() => onOpen(a.alumnoId)} />
              ))}

              {hasRows ? <div className={s.bottomPad} /> : null}
            </div>
          )}
        </div>

        {/* Paginación */}
        <footer className={s.pager}>
          <button
            className={s.pagerBtn}
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={loading || page <= 0}
            type="button"
          >
            ← Anterior
          </button>

          <span className={s.pagerInfo}>
            Página <b>{page + 1}</b> de <b>{Math.max(1, totalPages)}</b>
          </span>

          <button
            className={s.pagerBtn}
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={loading || page >= totalPages - 1}
            type="button"
          >
            Siguiente →
          </button>
        </footer>
      </div>
    </section>
  );
}
