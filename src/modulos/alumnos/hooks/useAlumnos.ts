// src/modulos/alumnos/hooks/useAlumnos.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AlumnosService } from '../services/alumnos.service';
import type { Alumno, Page, AlumnoCreate } from '../types/alumno.types';
import type { AlumnoFilters } from '../ui/AlumnoFiltersBar/AlumnoFiltersBar';

const DEFAULT_FILTERS: AlumnoFilters = {
  q: '',
  escolaridadId: 'ALL',
  plantelId: 'ALL',
  fechaIngresoDesde: undefined,
  fechaIngresoHasta: undefined,
};

function norm(s?: string) {
  return (s ?? '').trim().toLowerCase();
}

function inRange(dateISO: string, desde?: string, hasta?: string) {
  if (!dateISO) return true;
  if (desde && dateISO < desde) return false;
  if (hasta && dateISO > hasta) return false;
  return true;
}

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Ocurrió un error inesperado.';
}

function toNumber(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

/**
 * ✅ Plantel "tolerante" para que NO se te vaya el listado a 0.
 * Ajusta aquí si tu API usa otra propiedad.
 */
function getPlantelId(a: Alumno): number | null {
  const x = a as unknown as {
    plantelId?: unknown;
    sedeId?: unknown;
    unidadId?: unknown;
    idPlantel?: unknown;
    plantel?: { id?: unknown } | null;
  };

  return (
    toNumber(x.plantelId) ??
    toNumber(x.sedeId) ??
    toNumber(x.unidadId) ??
    toNumber(x.idPlantel) ??
    toNumber(x.plantel?.id)
  );
}

export function useAlumnos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // paginado
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  // data
  const [pageData, setPageData] = useState<Page<Alumno> | null>(null);

  // filtros
  const [filters, setFilters] = useState<AlumnoFilters>(DEFAULT_FILTERS);

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Alumno | null>(null);

  const fetchPage = useCallback(
    async (p: number) => {
      setLoading(true);
      setError(null);

      try {
        const res = await AlumnosService.list({
          page: p,
          size,
          sort: 'nombreCompleto,asc',
        });

        setPageData(res);
      } catch (e: unknown) {
        setError(getErrorMessage(e) ?? 'No se pudo cargar el listado.');
        setPageData(null);
      } finally {
        setLoading(false);
      }
    },
    [size],
  );

  useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const refresh = useCallback(() => fetchPage(page), [fetchPage, page]);

  const onPageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  // ✅ filtros FE
  const filteredPageData = useMemo<Page<Alumno> | null>(() => {
    if (!pageData) return null;

    const q = norm(filters.q);

    const content = (pageData.content ?? []).filter((a) => {
      // q
      if (q) {
        const hay =
          norm(a.nombreCompleto).includes(q) ||
          norm(a.matricula).includes(q) ||
          norm(a.alumnoId).includes(q);
        if (!hay) return false;
      }

      // escolaridad (tu filter ya es number|'ALL')
      if (filters.escolaridadId !== 'ALL') {
        const aEsc = toNumber((a as unknown as { escolaridadId?: unknown }).escolaridadId);
        if (aEsc === null || aEsc !== filters.escolaridadId) return false;
      }

      // plantel
      if (filters.plantelId !== 'ALL') {
        const aPl = getPlantelId(a);
        // si el alumno no trae plantelId, NO lo escondas (para que no “desaparezca todo”)
        // Si tú sí quieres esconderlos, cambia esto a: if (aPl === null || aPl !== filters.plantelId) return false;
        if (aPl !== null && aPl !== filters.plantelId) return false;
      }

      // rango fechas ingreso
      if (!inRange(a.fechaIngreso, filters.fechaIngresoDesde, filters.fechaIngresoHasta))
        return false;

      return true;
    });

    return { ...pageData, content };
  }, [pageData, filters]);

  const openDrawer = useCallback(async (alumnoId: string) => {
    setDrawerOpen(true);
    setSelected(null);
    setError(null);

    try {
      const full = await AlumnosService.getById(alumnoId);
      setSelected(full);
    } catch (e: unknown) {
      setError(getErrorMessage(e) ?? 'No se pudo cargar el detalle.');
    }
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const crearAlumno = useCallback(
    async (payload: {
      nombreCompleto: string;
      matricula: string;
      escolaridadId: number;
      plantelId: number;
      fechaIngreso: string;
      carreraId?: string | null;
    }) => {
      // ✅ cuerpo tipado: adiós Record<string,unknown>, adiós TS2345
      const body: AlumnoCreate = {
        nombreCompleto: payload.nombreCompleto,
        matricula: payload.matricula,
        escolaridadId: payload.escolaridadId,
        plantelId: payload.plantelId,
        fechaIngreso: payload.fechaIngreso,
        ...(payload.carreraId ? { carreraId: payload.carreraId } : {}),
      };

      const created = await AlumnosService.create(body);

      setPage(0);
      await fetchPage(0);

      return created;
    },
    [fetchPage],
  );

  const totalFilteredLocal = filteredPageData?.content?.length ?? 0;

  return {
    pageData: filteredPageData,
    loading,
    error,

    filters,
    setFilters,

    onPageChange,
    page,

    refresh,
    crearAlumno,

    drawerOpen,
    selected,
    openDrawer,
    closeDrawer,

    totalFilteredLocal,
  };
}
