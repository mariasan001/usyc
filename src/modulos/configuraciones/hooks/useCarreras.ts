// src/modules/configuraciones/catalogos/hooks/useCarreras.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CarrerasService } from '../services/carreras.service';
import type { Carrera, CarreraCreate, CarreraUpdate } from '../types/carreras.types';

type ListParams = { soloActivos?: boolean; escolaridadId?: number };

export function useCarreras(initialParams: ListParams = { soloActivos: true }) {
  const [items, setItems] = useState<Carrera[]>([]);
  const [params, setParams] = useState<ListParams>(initialParams);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let data: Carrera[] = [];

      if (typeof params.escolaridadId === 'number') {
        data = await CarrerasService.listByEscolaridad(params.escolaridadId, {
          soloActivos: params.soloActivos,
        });
      } else {
        data = await CarrerasService.list({ soloActivos: params.soloActivos });
      }

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

  const create = useCallback(
    async (payload: CarreraCreate) => {
      setIsSaving(true);
      setError(null);
      try {
        const created = await CarrerasService.create(payload);
        await reload();
        return created;
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const update = useCallback(
    async (carreraId: string, payload: CarreraUpdate) => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await CarrerasService.update(carreraId, payload);
        await reload();
        return updated;
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const activar = useCallback(
    async (carreraId: string) => {
      setIsSaving(true);
      setError(null);
      try {
        await CarrerasService.activar(carreraId);
        await reload();
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const desactivar = useCallback(
    async (carreraId: string) => {
      setIsSaving(true);
      setError(null);
      try {
        await CarrerasService.desactivar(carreraId);
        await reload();
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

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
    [
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
    ],
  );
}
