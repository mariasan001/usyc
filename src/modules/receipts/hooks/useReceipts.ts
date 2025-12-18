'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createReceiptService } from '../services/receipt.service';
import type { Receipt, ReceiptCreateInput, ReceiptQuery, ReceiptStatus } from '../types/receipt.types';

type UiQuery = {
  q: string;
  status: 'ALL' | ReceiptStatus;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD
};

const defaultQuery: UiQuery = {
  q: '',
  status: 'ALL',
  dateFrom: '',
  dateTo: '',
};

export function useReceipts() {
  const api = useMemo(() => createReceiptService(), []);

  const [items, setItems] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState<UiQuery>(defaultQuery);

  const buildQuery = useCallback((): ReceiptQuery => {
    return {
      q: query.q || undefined,
      status: query.status,
      dateFrom: query.dateFrom || undefined,
      dateTo: query.dateTo || undefined,
    };
  }, [query]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.list(buildQuery());
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar recibos');
    } finally {
      setLoading(false);
    }
  }, [api, buildQuery]);

  useEffect(() => {
    const t = setTimeout(() => {
      refresh();
    }, 180);
    return () => clearTimeout(t);
  }, [query, refresh]);

  const createReceipt = useCallback(
    async (input: ReceiptCreateInput) => {
      try {
        setCreating(true);
        setError(null);
        const r = await api.create(input);
        await refresh();
        return r;
      } catch (e: any) {
        setError(e?.message ?? 'Error al crear recibo');
        throw e;
      } finally {
        setCreating(false);
      }
    },
    [api, refresh]
  );

  const cancelReceipt = useCallback(
    async (folio: string, reason: string) => {
      try {
        setError(null);
        const r = await api.cancel(folio, reason);
        await refresh();
        return r;
      } catch (e: any) {
        setError(e?.message ?? 'Error al cancelar recibo');
        throw e;
      }
    },
    [api, refresh]
  );

  return {
    items,
    loading,
    creating,
    error,

    query,
    setQuery,
    refresh,

    createReceipt,
    cancelReceipt,
  };
}
