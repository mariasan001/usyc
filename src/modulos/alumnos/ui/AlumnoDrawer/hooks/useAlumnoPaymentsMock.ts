import { useMemo, useState } from 'react';
import type { PaymentItem, PaymentMethod } from '../types/alumno-drawer.types';
import { cmpISO, uid } from '../utils/drawer.dates';

export function useAlumnoPaymentsMock(alumnoId?: string | null) {
  const [payments, setPayments] = useState<PaymentItem[]>([]);

  const alumnoPayments = useMemo(() => {
    if (!alumnoId) return [];
    return payments
      .filter((p) => p.alumnoId === alumnoId)
      .sort((a, b) => cmpISO(b.date, a.date));
  }, [payments, alumnoId]);

  function addMensualidad(args: { alumnoId: string; date: string; amount: number; method: PaymentMethod }) {
    const { alumnoId, date, amount, method } = args;

    const exists = payments.some(
      (p) => p.alumnoId === alumnoId && p.type === 'MENSUALIDAD' && p.date === date && p.status === 'PAGADO',
    );
    if (exists) return;

    setPayments((prev) => [
      {
        id: uid('pay'),
        alumnoId,
        type: 'MENSUALIDAD',
        concept: 'Mensualidad',
        amount,
        date,
        method,
        status: 'PAGADO',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  function addExtra(args: { alumnoId: string; date: string; amount: number; concept: string; method: PaymentMethod }) {
    const { alumnoId, date, amount, concept, method } = args;
    if (!Number.isFinite(amount) || amount <= 0) return;

    setPayments((prev) => [
      {
        id: uid('extra'),
        alumnoId,
        type: 'EXTRA',
        concept: concept.trim() || 'Pago extra',
        amount,
        date,
        method,
        status: 'PAGADO',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  function toggleStatus(paymentId: string) {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId ? { ...p, status: p.status === 'PAGADO' ? 'PENDIENTE' : 'PAGADO' } : p
      )
    );
  }

  function remove(paymentId: string) {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  }

  return { payments, alumnoPayments, addMensualidad, addExtra, toggleStatus, remove };
}
