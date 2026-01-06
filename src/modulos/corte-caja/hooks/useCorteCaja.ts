'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/modulos/autenticacion/contexto/AuthContext';
import type { CorteCajaDTO, CorteCajaReciboDTO } from '../types/corte-caja.types';
import { CorteCajaService } from '../services/useCorteCaja';

type CorteCajaFilters = {
  fecha: string;              // YYYY-MM-DD
  plantelId: number | null;   // null = ALL (solo admin)
  q: string;                  // filtro local
};

function todayISO(): string {
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
  const { usuario, tieneRol } = useAuth();

  const esAdmin = tieneRol('ADMIN');
  const plantelUsuarioId = usuario?.plantelId ?? null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<CorteCajaDTO | null>(null);
  const [filters, setFilters] = useState<CorteCajaFilters>(DEFAULT_FILTERS);

  /**
   * ✅ Regla: si NO es admin, forzamos plantelId = plantelUsuarioId
   * Esto evita que un consultor intente “hackear” el state.
   */
  useEffect(() => {
    if (!usuario) return;

    if (!esAdmin) {
      // Si no hay plantelId en usuario, no podemos consultar (regla de negocio)
      if (plantelUsuarioId == null) {
        setError('Tu usuario no tiene plantel asignado. Contacta a un administrador.');
        setData(null);
        return;
      }

      setFilters((prev) => ({ ...prev, plantelId: plantelUsuarioId }));
    }
  }, [usuario, esAdmin, plantelUsuarioId]);

  const fetchCorte = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fecha = filters.fecha;

      // ✅ Admin puede mandar null (ALL). No admin => forzado al plantel del usuario.
      const plantelIdFinal = esAdmin ? filters.plantelId : plantelUsuarioId;

      if (!fecha) throw new Error('Selecciona una fecha válida.');

      if (!esAdmin && plantelIdFinal == null) {
        throw new Error('Tu usuario no tiene plantel asignado.');
      }

      const res = await CorteCajaService.get({
        fecha,
        plantelId: plantelIdFinal,
      });

      setData(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo cargar el corte de caja.';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters.fecha, filters.plantelId, esAdmin, plantelUsuarioId]);

  useEffect(() => {
    // evita disparar antes de tener usuario para no-admin
    if (!esAdmin && !usuario) return;
    fetchCorte();
  }, [fetchCorte, esAdmin, usuario]);

  const recibosFiltrados = useMemo(() => {
    const items = data?.recibos ?? [];
    const q = norm(filters.q);
    if (!q) return items;

    return items.filter((r: CorteCajaReciboDTO) => {
      return (
        norm(r.folio).includes(q) ||
        norm(r.folioLegacy).includes(q) ||
        norm(r.alumnoNombre).includes(q) ||
        norm(r.alumnoId).includes(q) ||
        norm(r.concepto).includes(q) ||
        norm(r.estatusDesc).includes(q) ||
        norm(r.tipoPagoDesc).includes(q)
      );
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

    // ✅ extra: para UI
    esAdmin,
    plantelUsuarioId,
    plantelUsuarioNombre: usuario?.plantelName ?? null,
  };
}
