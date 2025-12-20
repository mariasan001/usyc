'use client';

import { PlantelesService } from '@/modulos/configuraciones/services/planteles.service';
import { Plantel } from '@/modulos/configuraciones/types/planteles.types';
import { useEffect, useState } from 'react';


export function usePlanteles(params?: { soloActivos?: boolean }) {
  const [items, setItems] = useState<Plantel[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    PlantelesService.list(params)
      .then((r) => {
        if (!alive) return;
        setItems(r);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [params?.soloActivos]);

  return { items, isLoading, error };
}
