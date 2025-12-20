// src/modulos/alumnos/hooks/useAlumnoById.ts
'use client';

import { useCallback, useRef, useState } from 'react';
import { AlumnosService } from '../services/alumnos.service';
import type { Alumno } from '../types/alumno.types';

type State = {
  loading: boolean;
  error: string | null;
  data: Alumno | null;
};

export function useAlumnoById() {
  const cacheRef = useRef<Map<string, Alumno>>(new Map());

  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    data: null,
  });

  const fetchById = useCallback(async (alumnoId: string) => {
    if (!alumnoId) return;

    // ✅ cache
    const cached = cacheRef.current.get(alumnoId);
    if (cached) {
      setState({ loading: false, error: null, data: cached });
      return cached;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const data = await AlumnosService.getById(alumnoId);
      cacheRef.current.set(alumnoId, data);
      setState({ loading: false, error: null, data });
      return data;
    } catch (e: any) {
      setState({
        loading: false,
        error: e?.message ?? 'No se pudo cargar el alumno.',
        data: null,
      });
      throw e;
    }
  }, []);

  const clear = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    fetchById,
    clear,
  };
}
