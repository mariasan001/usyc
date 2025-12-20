'use client';

import { useCallback, useMemo, useState } from 'react';
import { AlumnosService } from '../services/alumnos.service';
import type { Alumno } from '../types/alumno.types';

export function useAlumnoById() {
  const [item, setItem] = useState<Alumno | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const getById = useCallback(async (alumnoId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AlumnosService.getById(alumnoId);
      setItem(res);
      return res;
    } catch (e) {
      setError(e);
      setItem(null);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setItem(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return useMemo(
    () => ({ item, isLoading, error, getById, reset }),
    [item, isLoading, error, getById, reset],
  );
}
