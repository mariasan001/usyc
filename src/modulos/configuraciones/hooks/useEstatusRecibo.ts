// src/modules/configuraciones/catalogos/hooks/useEstatusRecibo.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EstatusReciboService } from '../services/estatusRecibo.service';
import type {
  EstatusRecibo,
  EstatusReciboCreate,
  EstatusReciboUpdate,
} from '../types/estatusRecibo.types';

type ListParams = { soloActivos?: boolean };

export function useEstatusRecibo(initialParams: ListParams = { soloActivos: true }) {
  const [items, setItems] = useState<EstatusRecibo[]>([]);
  const [params, setParams] = useState<ListParams>(initialParams);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await EstatusReciboService.list(params);
      setItems(data);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(async (payload: EstatusReciboCreate) => {
    setIsSaving(true);
    setError(null);
    try {
      const created = await EstatusReciboService.create(payload);
      await reload();
      return created;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [reload]);

  const update = useCallback(async (id: number, payload: EstatusReciboUpdate) => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await EstatusReciboService.update(id, payload);
      await reload();
      return updated;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [reload]);

  const activar = useCallback(async (id: number) => {
    setIsSaving(true);
    setError(null);
    try {
      await EstatusReciboService.activar(id);
      await reload();
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [reload]);

  const desactivar = useCallback(async (id: number) => {
    setIsSaving(true);
    setError(null);
    try {
      await EstatusReciboService.desactivar(id);
      await reload();
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [reload]);

  return useMemo(
    () => ({
      items,
      params,
      isLoading,
      isSaving,
      error,
      reload,
      setParams,
      create,
      update,
      activar,
      desactivar,
    }),
    [items, params, isLoading, isSaving, error, reload, setParams, create, update, activar, desactivar],
  );
}
