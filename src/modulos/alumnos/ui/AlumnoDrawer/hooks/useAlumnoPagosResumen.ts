'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AlumnoPagosResumenDTO } from '../types/alumno-pagos-resumen.types';
import { AlumnosPagosService } from '@/modulos/alumnos/services/alumnos-pagos.service';

type State = {
  data: AlumnoPagosResumenDTO | null;
  loading: boolean;
  error: unknown;
};

export function useAlumnoPagosResumen(alumnoId: string | null) {
  const [st, setSt] = useState<State>({ data: null, loading: false, error: null });

  const load = useCallback(async () => {
    if (!alumnoId) {
      setSt({ data: null, loading: false, error: null });
      return;
    }

    setSt((p) => ({ ...p, loading: true, error: null }));
    try {
      const data = await AlumnosPagosService.getResumen(alumnoId);
      setSt({ data, loading: false, error: null });
    } catch (err) {
      setSt({ data: null, loading: false, error: err });
    }
  }, [alumnoId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...st, reload: load };
}
