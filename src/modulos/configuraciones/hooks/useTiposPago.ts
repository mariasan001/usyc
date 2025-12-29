// src/modulos/configuraciones/hooks/useTiposPago.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { TipoPago, TipoPagoCreate, TipoPagoUpdate } from '../types/tiposPago.types';
import { tiposPagoService } from '../services/tiposPago.service';

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
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * ✅ Toggle Active (NO DELETE)
   * - Swagger: PUT /tipos-pago/{id} con { name, active }
   */
  async function toggleActive(item: TipoPago) {
    return update(item.id, { name: item.name, active: !item.active });
  }

  async function activar(item: TipoPago) {
    if (item.active) return;
    return update(item.id, { name: item.name, active: true });
  }

  async function desactivar(item: TipoPago) {
    if (!item.active) return;
    return update(item.id, { name: item.name, active: false });
  }

  /**
   * ✅ DELETE real (si algún día lo ocupas como borrado)
   * Ojo: si el backend lo usa como “borrado lógico”, puedes mapearlo aquí.
   */
  async function remove(id: number) {
    setIsSaving(true);
    setError(null);
    try {
      await tiposPagoService.remove(id);
      await load();
    } catch (e) {
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

    // ✅ ahora existen
    toggleActive,
    activar,
    desactivar,

    // opcional
    remove,
  };
}
