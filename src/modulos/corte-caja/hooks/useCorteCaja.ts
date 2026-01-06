// src/modulos/corte-caja/hooks/useCorteCaja.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CorteCajaDTO, CorteCajaReciboDTO } from '../types/corte-caja.types';
import { CorteCajaService } from '../services/useCorteCaja';

type CorteCajaFilters = {
  /** Fecha del corte (YYYY-MM-DD) */
  fecha: string;

  /** Plantel opcional. Si viene null => no filtra por plantel */
  plantelId: number | null;

  /** Buscador local sobre la tabla (no pega al backend) */
  q: string;
};

function todayISO(): string {
  // YYYY-MM-DD en local (suficiente para corte diario)
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function norm(v?: string) {
  return (v ?? '').trim().toLowerCase();
}

const DEFAULT_FILTERS: CorteCajaFilters = {
  fecha: todayISO(),
  plantelId: null,
  q: '',
};

export function useCorteCaja() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<CorteCajaDTO | null>(null);
  const [filters, setFilters] = useState<CorteCajaFilters>(DEFAULT_FILTERS);

  const fetchCorte = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await CorteCajaService.get({
        fecha: filters.fecha,
        plantelId: filters.plantelId,
      });

      // Respuesta defensiva (si algo raro llega)
      if (!res || typeof res !== 'object') {
        setData(null);
        setError('La respuesta del corte de caja llegó vacía o inválida.');
        return;
      }

      setData(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo cargar el corte de caja.';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters.fecha, filters.plantelId]);

  // Auto-carga al montar y cuando cambien fecha/plantel.
  useEffect(() => {
    fetchCorte();
  }, [fetchCorte]);

  const recibosFiltrados = useMemo(() => {
    const items = data?.recibos ?? [];
    const q = norm(filters.q);
    if (!q) return items;

    return items.filter((r: CorteCajaReciboDTO) => {
      const hay =
        norm(r.folio).includes(q) ||
        norm(r.folioLegacy).includes(q) ||
        norm(r.alumnoNombre).includes(q) ||
        norm(r.alumnoId).includes(q) ||
        norm(r.concepto).includes(q) ||
        norm(r.estatusDesc).includes(q) ||
        norm(r.tipoPagoDesc).includes(q);

      return hay;
    });
  }, [data, filters.q]);

  return {
    loading,
    error,

    data,
    recibos: recibosFiltrados,

    filters,
    setFilters,

    refresh: fetchCorte,
  };
}
