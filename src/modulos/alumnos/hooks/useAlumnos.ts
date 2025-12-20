// src/modulos/alumnos/hooks/useAlumnos.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlumnosService } from '../services/alumnos.service';
import type { Alumno, Page } from '../types/alumno.types';
import type { AlumnoFilters } from '../ui/AlumnoFiltersBar/AlumnoFiltersBar';

const DEFAULT_FILTERS: AlumnoFilters = {
  q: '',
  escolaridadId: 'ALL',
  estado: 'ALL',
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

export function useAlumnos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // paginado
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  // data (puede ser null al inicio, tu tabla lo soporta)
  const [pageData, setPageData] = useState<Page<Alumno> | null>(null);

  // filtros (SIEMPRE definido)
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
      } catch (e: any) {
        setError(e?.message ?? 'No se pudo cargar el listado.');
        setPageData(null);
      } finally {
        setLoading(false);
      }
    },
    [size],
  );

  // primera carga + cuando cambie page
  useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const refresh = useCallback(() => fetchPage(page), [fetchPage, page]);

  const onPageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  // ⚠️ filtros FE (no query al backend todavía)
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

      // escolaridad
      if (filters.escolaridadId !== 'ALL') {
        const id = Number(filters.escolaridadId);
        if (Number(a.escolaridadId) !== id) return false;
      }

      // estado
      if (filters.estado === 'ACTIVO' && !a.activo) return false;
      if (filters.estado === 'EGRESADO' && a.activo) return false; // si tu regla es distinta, ajustamos
      // POR_VENCER depende de fechaTermino; si luego quieres lo calculamos

      // rango fechas ingreso
      if (!inRange(a.fechaIngreso, filters.fechaIngresoDesde, filters.fechaIngresoHasta))
        return false;

      return true;
    });

    return {
      ...pageData,
      content,
      // ojo: totalElements/totalPages siguen siendo del backend (global),
      // si quieres “total filtrado” real, lo mostramos aparte en UI.
    };
  }, [pageData, filters]);

  const openDrawer = useCallback(async (alumnoId: string) => {
    setDrawerOpen(true);
    setSelected(null);
    setError(null);
    try {
      const full = await AlumnosService.getById(alumnoId);
      setSelected(full);
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo cargar el detalle.');
    }
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const crearAlumno = useCallback(
    async (payload: {
      nombreCompleto: string;
      matricula: string;
      escolaridadId: number;
      carreraId?: string | null;
      fechaIngreso: string;
    }) => {
      const body = {
        nombreCompleto: payload.nombreCompleto,
        matricula: payload.matricula,
        escolaridadId: payload.escolaridadId,
        fechaIngreso: payload.fechaIngreso,
        ...(payload.carreraId ? { carreraId: payload.carreraId } : {}),
      };

      const created = await AlumnosService.create(body);

      // después de crear: vuelve a página 0 y recarga
      setPage(0);
      await fetchPage(0);

      return created;
    },
    [fetchPage],
  );

  // totals (para badge si quieres que sea “filtrado local”)
  const totalFilteredLocal = filteredPageData?.content?.length ?? 0;

  return {
    // pageData (la tabla ya lo espera)
    pageData: filteredPageData,
    loading,
    error,

    // filtros
    filters,
    setFilters,

    // paginado
    onPageChange,
    page,

    // acciones
    refresh,
    crearAlumno,

    // drawer
    drawerOpen,
    selected,
    openDrawer,
    closeDrawer,

    // extras opcionales
    totalFilteredLocal,
  };
}
