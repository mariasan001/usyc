'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  EstatusRecibo,
  EstatusReciboCreate,
  EstatusReciboUpdate,
} from '../types/estatusRecibo.types';
import { estatusReciboService } from '../services/estatusRecibo.service';
import { ApiError } from '@/lib/api/api.errors';

function isAbortError(e: unknown) {
  return e instanceof DOMException && e.name === 'AbortError';
}

function debugApiError(e: unknown) {
  if (e instanceof ApiError) {
    // eslint-disable-next-line no-console
    console.groupCollapsed('[EstatusRecibo] ApiError');
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

export function useEstatusRecibo() {
  const [items, setItems] = useState<EstatusRecibo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await estatusReciboService.list({ signal });
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
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    void load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  async function create(payload: EstatusReciboCreate) {
    setIsSaving(true);
    setError(null);

    try {
      await estatusReciboService.create(payload);
      await load();
    } catch (e) {
      debugApiError(e);
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }

  async function update(id: number, payload: EstatusReciboUpdate) {
    setIsSaving(true);
    setError(null);

    try {
      await estatusReciboService.update(id, payload);
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
  };
}
