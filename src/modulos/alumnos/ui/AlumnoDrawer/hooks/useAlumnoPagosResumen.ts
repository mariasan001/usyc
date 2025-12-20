'use client';

import { useEffect, useState } from 'react';
import type { AlumnoPagosResumen } from '../types/alumno-pagos-resumen.types';
import { AlumnosPagosService } from '@/modulos/alumnos/services/alumnos-pagos.service';

export function useAlumnoPagosResumen(alumnoId?: string) {
  const [data, setData] = useState<AlumnoPagosResumen | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!alumnoId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(null);

    AlumnosPagosService.getPagosResumen(alumnoId)
      .then((res) => {
        if (!alive) return;
        setData(res);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Error al cargar pagos-resumen');
        setData(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [alumnoId]);

  return { data, loading, error };
}
