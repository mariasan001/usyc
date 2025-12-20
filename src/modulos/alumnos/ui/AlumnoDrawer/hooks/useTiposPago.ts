'use client';

import { tiposPagoService } from '@/modulos/configuraciones/services/tiposPago.service';
import { TipoPago } from '@/modulos/configuraciones/types/tiposPago.types';
import { useCallback, useEffect, useState } from 'react';

export function useTiposPago({ soloActivos }: { soloActivos: boolean }) {
  const [items, setItems] = useState<TipoPago[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    const ctrl = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const data = await tiposPagoService.list({
        soloActivos,
        signal: ctrl.signal,
      });
      setItems(data ?? []);
    } catch (e) {
      // si aborta, lo ignoramos silenciosamente
      if ((e as any)?.name !== 'AbortError') setError(e);
    } finally {
      setIsLoading(false);
    }

    return () => ctrl.abort();
  }, [soloActivos]);

  useEffect(() => {
    const ctrl = new AbortController();

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await tiposPagoService.list({
          soloActivos,
          signal: ctrl.signal,
        });
        setItems(data ?? []);
      } catch (e) {
        if ((e as any)?.name !== 'AbortError') setError(e);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [soloActivos]);

  return { items, isLoading, error, reload };
}
