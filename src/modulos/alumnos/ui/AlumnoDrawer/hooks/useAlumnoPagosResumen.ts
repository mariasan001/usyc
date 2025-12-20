'use client';

import { useEffect, useState } from 'react';
import type { AlumnoPagosResumenDTO } from '../types/alumno-pagos-resumen.types';
import { AlumnosPagosService } from '@/modulos/alumnos/services/alumnos-pagos.service';

type State = {
  data: AlumnoPagosResumenDTO | null;
  loading: boolean;
  error: unknown;
};

export function useAlumnoPagosResumen(alumnoId: string | null) {
  const [st, setSt] = useState<State>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!alumnoId) {
      setSt({ data: null, loading: false, error: null });
      return;
    }

    let alive = true;

    setSt((p) => ({ ...p, loading: true, error: null }));

    AlumnosPagosService.getResumen(alumnoId)
      .then((data) => {
        if (!alive) return;
        setSt({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!alive) return;
        setSt({ data: null, loading: false, error: err });
      });

    return () => {
      alive = false;
    };
  }, [alumnoId]);

  return st;
}
