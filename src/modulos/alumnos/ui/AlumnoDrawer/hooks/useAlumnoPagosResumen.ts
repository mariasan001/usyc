// src/modulos/alumnos/hooks/useAlumnoPagosResumen.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import { AlumnoPagosResumenDTO } from '../types/alumno-pagos-resumen.types';


type State = {
  data: AlumnoPagosResumenDTO | null;
  loading: boolean;
  error: string | null;
};

type ApiErrorLike = {
  message?: unknown;
  name?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorName(err: unknown): string | null {
  if (!isRecord(err)) return null;
  const name = (err as ApiErrorLike).name;
  return typeof name === 'string' ? name : null;
}

function getErrorMessageFromObject(err: unknown): string | null {
  if (!isRecord(err)) return null;
  const msg = (err as ApiErrorLike).message;
  return typeof msg === 'string' ? msg : null;
}

function isAbortError(err: unknown): boolean {
  // Navegadores: DOMException AbortError
  if (err instanceof DOMException && err.name === 'AbortError') return true;

  // Node / custom errors: { name: "AbortError" }
  return getErrorName(err) === 'AbortError';
}

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;

  const msg = getErrorMessageFromObject(err);
  if (msg) return msg;

  try {
    return JSON.stringify(err);
  } catch {
    return 'Error desconocido';
  }
}

export function useAlumnoPagosResumen(alumnoId?: string) {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const fetchResumen = useCallback(async () => {
    if (!alumnoId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      // 🔧 Ajusta si tu ruta se llama distinto en api.routes
      // Ej: API.alumnos.pagosResumen(alumnoId)
      const url = API.alumnos.pagosResumen(alumnoId);

      const res = await api<AlumnoPagosResumenDTO>(url, {
        method: 'GET',
        signal: controller.signal,
      });

      setState({ data: res, loading: false, error: null });
    } catch (err) {
      if (isAbortError(err)) return;

      setState((s) => ({
        ...s,
        loading: false,
        error: toErrorMessage(err),
      }));
    }
  }, [alumnoId]);

  useEffect(() => {
    void fetchResumen();

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchResumen]);

  const reload = useCallback(async () => {
    await fetchResumen();
  }, [fetchResumen]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    reload,
  };
}
