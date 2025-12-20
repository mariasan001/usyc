'use client';

import { useEffect, useState } from 'react';
import { AlumnosService } from '../services/alumnos.service';
import type { Alumno } from '../types/alumno.types';

export function useAlumnoById(alumnoId?: string | null, enabled = true) {
  const [data, setData] = useState<Alumno | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!alumnoId) {
      setData(null);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(null);

    AlumnosService.getById(alumnoId)
      .then((res) => {
        if (!alive) return;
        setData(res);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e);
        setData(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [alumnoId, enabled]);

  return { data, loading, error };
}
