'use client';

import { useCallback, useMemo, useState } from 'react';
import { AlumnosService } from '../services/alumnos.service';
import type { Alumno, AlumnoCreate } from '../types/alumno.types';

export function useAlumnoCreate() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [created, setCreated] = useState<Alumno | null>(null);

  const create = useCallback(async (payload: AlumnoCreate) => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await AlumnosService.create(payload);
      setCreated(res);
      return res;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const reset = useCallback(() => {
    setCreated(null);
    setError(null);
    setIsSaving(false);
  }, []);

  return useMemo(
    () => ({ create, reset, created, isSaving, error }),
    [create, reset, created, isSaving, error],
  );
}
