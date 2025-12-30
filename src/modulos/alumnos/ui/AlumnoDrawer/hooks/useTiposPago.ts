'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { tiposPagoService } from '@/modulos/configuraciones/services/tiposPago.service';
import type { TipoPago } from '@/modulos/configuraciones/types/tiposPago.types';

type Args = { soloActivos: boolean };

type State = {
  items: TipoPago[];
  isLoading: boolean;
  error: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorName(err: unknown): string | null {
  if (!isRecord(err)) return null;
  const name = err['name'];
  return typeof name === 'string' ? name : null;
}

function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  return getErrorName(err) === 'AbortError';
}

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;

  if (isRecord(err)) {
    const msg = err['message'];
    if (typeof msg === 'string') return msg;
  }

  try {
    return JSON.stringify(err);
  } catch {
    return 'Error desconocido';
  }
}

export function useTiposPago({ soloActivos }: Args) {
  const [state, setState] = useState<State>({
    items: [],
    isLoading: false,
    error: null,
  });

  // ✅ Cancelación real entre requests (si cambias rápido filtros o recargas)
  const abortRef = useRef<AbortController | null>(null);

  const fetchList = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const data = await tiposPagoService.list({
        soloActivos,
        signal: ctrl.signal,
      });

      setState({ items: data ?? [], isLoading: false, error: null });
    } catch (err) {
      if (isAbortError(err)) return;

      setState((s) => ({
        ...s,
        isLoading: false,
        error: toErrorMessage(err),
      }));
    }
  }, [soloActivos]);

  useEffect(() => {
    void fetchList();

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchList]);

  const reload = useCallback(async () => {
    await fetchList();
  }, [fetchList]);

  return {
    items: state.items,
    isLoading: state.isLoading,
    error: state.error,
    reload,
  };
}
