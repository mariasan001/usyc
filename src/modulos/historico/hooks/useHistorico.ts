'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReciboHistoricoDTO } from '../types/historico.types';
import { HistoricoService } from '../services/useHistorico';

type HistoricoFilters = {
  q: string;
};

const DEFAULT_FILTERS: HistoricoFilters = { q: '' };

function norm(v?: string) {
  return (v ?? '').trim().toLowerCase();
}

export function useHistorico() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<ReciboHistoricoDTO[]>([]);
  const [filters, setFilters] = useState<HistoricoFilters>(DEFAULT_FILTERS);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await HistoricoService.list();
      setItems(Array.isArray(res) ? res : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo cargar el histórico.';
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = useMemo(() => {
    const q = norm(filters.q);
    if (!q) return items;

    return items.filter((r) => {
      const hay =
        norm(r.folio).includes(q) ||
        norm(r.alumnoNombre).includes(q) ||
        norm(r.alumnoId).includes(q) ||
        norm(r.concepto).includes(q) ||
        norm(r.estatusNombre).includes(q) ||
        norm(r.tipoPagoName).includes(q);

      return hay;
    });
  }, [items, filters.q]);

  return {
    loading,
    error,
    items: filtered,
    total: filtered.length,

    filters,
    setFilters,

    refresh: fetchAll,
  };
}
