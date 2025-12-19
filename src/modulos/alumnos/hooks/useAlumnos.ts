// src/modulos/alumnos/hooks/useAlumnos.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Alumno, AlumnoCreatePayload, ID } from '../types/alumnos.tipos';
import { AlumnosService } from '../services/alumnos.service';
import { calcularEstado } from '../utils/alumnos-calculos.utils';

export type AlumnosFilters = {
  q: string;
  escolaridadId: ID | 'ALL';
  estado: 'ALL' | 'ACTIVO' | 'POR_VENCER' | 'EGRESADO';
  fechaIngresoDesde?: string; // YYYY-MM-DD
  fechaIngresoHasta?: string; // YYYY-MM-DD
};

const DEFAULT_FILTERS: AlumnosFilters = {
  q: '',
  escolaridadId: 'ALL',
  estado: 'ALL',
};

function inRange(dateISO: string, from?: string, to?: string) {
  if (!from && !to) return true;
  if (from && dateISO < from) return false;
  if (to && dateISO > to) return false;
  return true;
}

export function useAlumnos() {
  const [list, setList] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<AlumnosFilters>(DEFAULT_FILTERS);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<ID | null>(null);

  const selected = useMemo(() => list.find((x) => x.id === selectedId) || null, [list, selectedId]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AlumnosService.listar();

      // recalcular estado por si el tiempo pasó (sin mutar store)
      const normalized = data.map((a) => ({
        ...a,
        estado: calcularEstado(a.fechaTermino),
      }));

      setList(normalized);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando alumnos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const crearAlumno = useCallback(async (payload: AlumnoCreatePayload) => {
    const a = await AlumnosService.crear(payload);
    setList((prev) => [a, ...prev]);
    return a;
  }, []);

  const openDrawer = useCallback((id: ID) => {
    setSelectedId(id);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    // dejamos selectedId por si quieres animar / persistir
  }, []);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    return list.filter((a) => {
      if (filters.escolaridadId !== 'ALL' && a.escolaridadId !== filters.escolaridadId) return false;
      if (filters.estado !== 'ALL' && a.estado !== filters.estado) return false;

      if (!inRange(a.fechaIngreso, filters.fechaIngresoDesde, filters.fechaIngresoHasta)) return false;

      if (q) {
        const haystack = `${a.nombre} ${a.matricula}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [list, filters]);

  return {
    list,
    filtered,
    loading,
    error,

    filters,
    setFilters,

    refresh,

    crearAlumno,

    drawerOpen,
    selected,
    openDrawer,
    closeDrawer,
  };
}
