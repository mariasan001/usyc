'use client';

import { useCallback, useState } from 'react';
import { CanceladosService } from '../services/cancelados.service';
import type { ReciboCanceladoRow } from '../types/cancelados.types';

export function useCancelarRecibo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<ReciboCanceladoRow | null>(null);

  const cancelar = useCallback(async (reciboId: number, motivo: string) => {
    setLoading(true);
    setError(null);
    setOk(null);
    try {
      const res = await CanceladosService.cancelar(reciboId, motivo);
      setOk(res);
      return res;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo cancelar el recibo.';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setOk(null);
    setLoading(false);
  }, []);

  return { loading, error, ok, cancelar, reset };
}
