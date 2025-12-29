'use client';

import { useCallback, useEffect, useState } from 'react';
import type { TipoPago, TipoPagoCreate, TipoPagoUpdate } from '../types/tiposPago.types';
import { tiposPagoService } from '../services/tiposPago.service';

function isAbortError(e: unknown) {
  // fetch AbortController
  if (e instanceof DOMException && e.name === 'AbortError') return true;

  // por si tu service lanza un error con shape { name: 'AbortError' }
  if (typeof e === 'object' && e !== null && 'name' in e) {
    return (e as { name?: string }).name === 'AbortError';
  }

  return false;
}

export function useTiposPago({ soloActivos }: { soloActivos: boolean }) {
  const [items, setItems] = useState<TipoPago[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await tiposPagoService.list({ soloActivos, signal });
        setItems(data);
      } catch (e) {
        // ✅ abort = NO es error de UI
        if (isAbortError(e)) return;
        setError(e);
      } finally {
        setIsLoading(false);
      }
    },
    [soloActivos],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    void load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  async function create(payload: TipoPagoCreate) {
    setIsSaving(true);
    setError(null);
    try {
      await tiposPagoService.create(payload);
      await load();
    } catch (e) {
      if (isAbortError(e)) return;
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }

  async function update(id: number, payload: TipoPagoUpdate) {
    setIsSaving(true);
    setError(null);
    try {
      await tiposPagoService.update(id, payload);
      await load();
    } catch (e) {
      if (isAbortError(e)) return;
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(id: number) {
    setIsSaving(true);
    setError(null);
    try {
      await tiposPagoService.remove(id);
      await load();
    } catch (e) {
      if (isAbortError(e)) return;
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    items,
    isLoading,
    isSaving,
    error,
    reload: () => load(),
    create,
    update,
    remove,
  };
}
