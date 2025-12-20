'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  ConceptoPago,
  ConceptoPagoCreate,
  ConceptoPagoUpdate,
} from '../types/conceptosPago.types';
import { conceptosPagoService } from '../services/conceptosPago.service';
import { ApiError } from '@/lib/api/api.errors';

type Params = { soloActivos: boolean };

function isAbortError(e: unknown) {
  // Fetch abort suele lanzar DOMException con name = 'AbortError'
  return e instanceof DOMException && e.name === 'AbortError';
}

function debugApiError(e: unknown) {
  if (e instanceof ApiError) {
    // 🔥 Aquí normalmente viene la pista del backend: detail, message, enum, etc.
    // No lo mostramos en UI por default, pero sí lo dejamos “a mano”.
    // eslint-disable-next-line no-console
    console.groupCollapsed('[ConceptosPago] ApiError');
    // eslint-disable-next-line no-console
    console.log('status:', e.status);
    // eslint-disable-next-line no-console
    console.log('url:', e.url);
    // eslint-disable-next-line no-console
    console.log('message:', e.message);
    // eslint-disable-next-line no-console
    console.log('payload:', e.payload);
    // eslint-disable-next-line no-console
    console.groupEnd();
  }
}

export function useConceptosPago({ soloActivos }: Params) {
  const [items, setItems] = useState<ConceptoPago[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await conceptosPagoService.list({ soloActivos, signal });

        // Si se abortó justo al resolver, evitamos setState
        if (signal?.aborted) return;

        setItems(data);
      } catch (e) {
        if (isAbortError(e)) return;

        debugApiError(e);
        setError(e);
      } finally {
        if (signal?.aborted) return;
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

  async function create(payload: ConceptoPagoCreate) {
    setIsSaving(true);
    setError(null);

    try {
      await conceptosPagoService.create(payload);
      await load();
    } catch (e) {
      debugApiError(e);
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }

  async function update(conceptoId: number, payload: ConceptoPagoUpdate) {
    setIsSaving(true);
    setError(null);

    try {
      await conceptosPagoService.update(conceptoId, payload);
      await load();
    } catch (e) {
      debugApiError(e);
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }

  async function activar(conceptoId: number) {
    setIsSaving(true);
    setError(null);

    try {
      await conceptosPagoService.activar(conceptoId);
      await load();
    } catch (e) {
      debugApiError(e);
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }

  async function desactivar(conceptoId: number) {
    setIsSaving(true);
    setError(null);

    try {
      await conceptosPagoService.desactivar(conceptoId);
      await load();
    } catch (e) {
      debugApiError(e);
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
    activar,
    desactivar,
  };
}
