// src/modules/configuraciones/catalogos/hooks/useEscolaridades.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EscolaridadesService } from '../services/escolaridades.service';
import type { Escolaridad, EscolaridadCreate, EscolaridadUpdate } from '../types/escolaridades.types';

type ListParams = { soloActivos?: boolean };

export function useEscolaridades(initialParams: ListParams = { soloActivos: true }) {
  const [items, setItems] = useState<Escolaridad[]>([]);
  const [params, setParams] = useState<ListParams>(initialParams);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await EscolaridadesService.list(params);
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

  const create = useCallback(async (payload: EscolaridadCreate) => {
    setIsSaving(true);
    setError(null);
    try {
      const created = await EscolaridadesService.create(payload);
      // 🔥 refresco simple: vuelve a listar (evita inconsistencias)
      await reload();
      return created;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [reload]);

  const update = useCallback(async (id: number, payload: EscolaridadUpdate) => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await EscolaridadesService.update(id, payload);
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
      await EscolaridadesService.activar(id);
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
      await EscolaridadesService.desactivar(id);
      await reload();
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [reload]);

  const getByCodigo = useCallback((codigo: string) => {
    return EscolaridadesService.getByCodigo(codigo);
  }, []);

  const state = useMemo(
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
      getByCodigo,
    }),
    [items, params, isLoading, isSaving, error, reload, setParams, create, update, activar, desactivar, getByCodigo],
  );

  return state;
}
