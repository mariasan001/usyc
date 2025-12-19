// src/features/receipts/hooks/usePayments.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Payment, PaymentStatus } from '../types/payment.types';

export type PaymentsQuery = {
  q: string;
  status: 'ALL' | PaymentStatus;
  dateFrom: string;
  dateTo: string;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ✅ MOCK temporal (cámbialo por tu service real)
const seed: Payment[] = [
  {
    id: '1',
    folio: 'FOL-0001',
    alumnoNombre: 'Juan Perez',
    alumnoMatricula: 'LWD-2345',
    carrera: 'Enfermería',
    fecha: todayISO(),
    valor: 330,
    concepto: 'Colegiatura',
    estatus: 'EMITIDO',
    motivoCancelacion: null,
  },
];

export function usePayments() {
  const [items, setItems] = useState<Payment[]>(seed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState<PaymentsQuery>({
    q: '',
    status: 'ALL',
    dateFrom: '',
    dateTo: '',
  });

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: fetch real: setItems(await PaymentsService.list(query))
      await new Promise((r) => setTimeout(r, 200));
      setItems((prev) => [...prev]);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // si quieres auto-refrescar con filtros, habilítalo:
    // void refresh();
  }, [refresh]);

  const createPayment = useCallback(async (input: Omit<Payment, 'id' | 'folio' | 'estatus'>) => {
    // TODO: POST real
    const newItem: Payment = {
      ...input,
      id: crypto.randomUUID(),
      folio: `FOL-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      estatus: 'EMITIDO',
      motivoCancelacion: null,
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const cancelPayment = useCallback(async (id: string, motivo: string) => {
    // TODO: PATCH/POST real
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, estatus: 'CANCELADO', motivoCancelacion: motivo || 'Sin motivo' }
          : p
      )
    );
  }, []);

  const filtered = useMemo(() => {
    const q = query.q.trim().toLowerCase();

    const inRange = (iso: string) => {
      if (query.dateFrom && iso < query.dateFrom) return false;
      if (query.dateTo && iso > query.dateTo) return false;
      return true;
    };

    return items.filter((p) => {
      if (query.status !== 'ALL' && p.estatus !== query.status) return false;
      if (!inRange(p.fecha)) return false;

      if (!q) return true;
      return (
        p.folio.toLowerCase().includes(q) ||
        p.alumnoNombre.toLowerCase().includes(q) ||
        (p.alumnoMatricula ?? '').toLowerCase().includes(q) ||
        p.concepto.toLowerCase().includes(q) ||
        p.carrera.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  return {
    items: filtered,
    raw: items,
    loading,
    error,
    query,
    setQuery,
    refresh,
    createPayment,
    cancelPayment,
  };
}
