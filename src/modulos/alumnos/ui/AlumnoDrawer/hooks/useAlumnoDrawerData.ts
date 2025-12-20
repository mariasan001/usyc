'use client';

import { useMemo, useState } from 'react';
import type { Alumno } from '../../../types/alumno.types';

import type {
  DrawerTab,
  PaymentItem,
  PaymentMethod,
  ProjectionItem,
  Totals,
} from '../types/alumno-drawer.types';

/** ===== Utils mini (mock / sin AppISP) ===== */
function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function todayISO() {
  return toISODate(new Date());
}

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

// suma meses a YYYY-MM-DD y normaliza overflow (31/feb)
function addMonthsISO(iso: string, monthsToAdd: number) {
  const [y, m, d] = iso.split('-').map((x) => Number(x));
  const base = new Date(y, (m - 1) + monthsToAdd, d);
  const safe = new Date(
    base.getFullYear(),
    base.getMonth(),
    Math.min(d, daysInMonth(base.getFullYear(), base.getMonth())),
  );
  return toISODate(safe);
}

function cmpISO(a: string, b: string) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function uid(prefix = 'p') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/**
 * 💡 Fallback UI:
 * Si back manda fechaTermino null, nosotros la calculamos con:
 * fechaIngreso + duracionMeses
 */
function terminoUI(alumno: Alumno, duracionMeses: number) {
  const termino = alumno.fechaTermino;
  if (termino) return termino;

  const ingreso = alumno.fechaIngreso;
  if (!ingreso || !duracionMeses) return '—';

  return addMonthsISO(ingreso, duracionMeses);
}

/** ===== Hook ===== */
export function useAlumnoDrawerData({ alumno }: { alumno: Alumno | null }) {
  /**
   * ✅ IMPORTANTE:
   * No hay useEffect de “reset”.
   * El reset lo hace React remonteando el componente por `key` en AlumnoDrawerInner.
   */

  const [tab, setTab] = useState<DrawerTab>('RESUMEN');

  /** Pagos mock local */
  const [payments, setPayments] = useState<PaymentItem[]>([]);

  /** Form: mensualidad */
  const [payDate, setPayDate] = useState<string>(todayISO());
  const [payMethod, setPayMethod] = useState<PaymentMethod>('EFECTIVO');

  /** Form: extras */
  const [extraConcept, setExtraConcept] = useState('Curso / Conferencia');
  const [extraAmount, setExtraAmount] = useState('0');
  const [extraDate, setExtraDate] = useState<string>(todayISO());
  const [extraMethod, setExtraMethod] =
    useState<PaymentMethod>('TRANSFERENCIA');

  /** Identidad */
  const alumnoId = alumno?.alumnoId ?? '';
  const nombreCompleto = alumno?.nombreCompleto ?? '—';
  const matricula = alumno?.matricula ?? '—';
  const activo = !!alumno?.activo;

  /** Datos del plan (por ahora fallback si no vienen del back) */
  const precioMensual = Number((alumno as unknown as { precioMensual?: number })?.precioMensual ?? 0);
  const duracionMeses = Number((alumno as unknown as { duracionMeses?: number })?.duracionMeses ?? 0);

  const ingresoISO = alumno?.fechaIngreso ?? '—';
  const terminoISO = alumno ? terminoUI(alumno, duracionMeses) : '—';

  /** Catálogos placeholders (sin AppISP) */
  const escNombre = (alumno as unknown as { escolaridadNombre?: string })?.escolaridadNombre ?? '—';
  const carNombre = (alumno as unknown as { carreraNombre?: string })?.carreraNombre ?? '—';
  const plaNombre = (alumno as unknown as { plantelNombre?: string })?.plantelNombre ?? '—';

  /** Pagos del alumno */
  const alumnoPayments = useMemo(() => {
    if (!alumnoId) return [];
    return payments
      .filter((p) => p.alumnoId === alumnoId)
      .sort((a, b) => cmpISO(b.date, a.date));
  }, [payments, alumnoId]);

  /** Proyección (mock) */
  const projection = useMemo<ProjectionItem[]>(() => {
    if (!alumnoId || !alumno) return [];
    if (!ingresoISO || !duracionMeses || !precioMensual) return [];

    const mensualidades = alumnoPayments.filter(
      (p) => p.type === 'MENSUALIDAD',
    );

    const paidByDate = new Map<string, PaymentItem>();
    for (const p of mensualidades) {
      const prev = paidByDate.get(p.date);
      if (!prev) paidByDate.set(p.date, p);
      else if (prev.createdAt < p.createdAt) paidByDate.set(p.date, p);
    }

    const out: ProjectionItem[] = [];
    for (let i = 0; i < duracionMeses; i++) {
      const due = addMonthsISO(ingresoISO, i);
      const pay = paidByDate.get(due);

      out.push({
        idx: i + 1,
        dueDate: due,
        concept: `Mensualidad ${i + 1}`,
        amount: precioMensual,
        status: pay ? 'PAGADO' : 'PENDIENTE',
        method: pay?.method,
        paidAt: pay?.date,
        paymentId: pay?.id,
      });
    }

    return out;
  }, [alumno, alumnoId, alumnoPayments, ingresoISO, duracionMeses, precioMensual]);

  /** Totales (mock) */
  const totals = useMemo<Totals>(() => {
    if (!alumnoId || !alumno) {
      return {
        totalPlan: 0,
        totalExtras: 0,
        totalPagado: 0,
        saldo: 0,
        pagados: 0,
        pendientes: 0,
        vencidos: 0,
        nextDue: null,
      };
    }

    const totalPlan = precioMensual * duracionMeses;

    const extras = alumnoPayments.filter((p) => p.type === 'EXTRA');
    const totalExtras = extras.reduce((acc, p) => acc + p.amount, 0);

    const pagosPagados = alumnoPayments.filter((p) => p.status === 'PAGADO');
    const totalPagado = pagosPagados.reduce((acc, p) => acc + p.amount, 0);

    const saldo = Math.max(0, totalPlan + totalExtras - totalPagado);

    const pagados = projection.filter((x) => x.status === 'PAGADO').length;
    const pendientes = projection.filter((x) => x.status === 'PENDIENTE').length;

    const t = todayISO();
    const vencidos = projection.filter(
      (x) => x.status === 'PENDIENTE' && cmpISO(x.dueDate, t) < 0,
    ).length;

    const nextDue = projection.find((x) => x.status === 'PENDIENTE') ?? null;

    return {
      totalPlan,
      totalExtras,
      totalPagado,
      saldo,
      pagados,
      pendientes,
      vencidos,
      nextDue,
    };
  }, [alumno, alumnoId, alumnoPayments, projection, precioMensual, duracionMeses]);

  /** ===== Handlers pagos (mock) ===== */
  function addMensualidadPayment() {
    if (!alumnoId) return;

    const exists = alumnoPayments.some(
      (p) =>
        p.type === 'MENSUALIDAD' && p.date === payDate && p.status === 'PAGADO',
    );
    if (exists) return;

    const item: PaymentItem = {
      id: uid('pay'),
      alumnoId,
      type: 'MENSUALIDAD',
      concept: 'Mensualidad',
      amount: precioMensual,
      date: payDate,
      method: payMethod,
      status: 'PAGADO',
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [item, ...prev]);
  }

  function addExtraPayment() {
    if (!alumnoId) return;

    const amt = Number(extraAmount);
    if (!Number.isFinite(amt) || amt <= 0) return;

    const item: PaymentItem = {
      id: uid('extra'),
      alumnoId,
      type: 'EXTRA',
      concept: extraConcept.trim() || 'Pago extra',
      amount: amt,
      date: extraDate,
      method: extraMethod,
      status: 'PAGADO',
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [item, ...prev]);
    setExtraAmount('0');
  }

  function togglePaymentStatus(paymentId: string) {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, status: p.status === 'PAGADO' ? 'PENDIENTE' : 'PAGADO' }
          : p,
      ),
    );
  }

  function removePayment(paymentId: string) {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  }

  function printReceipt(paymentId: string) {
    // mock
    // eslint-disable-next-line no-alert
    alert(`(Mock) Generar comprobante para: ${paymentId}`);
  }

  return {
    // ui
    tab,
    setTab,

    // identity
    alumnoId,
    nombreCompleto,
    matricula,
    activo,

    // plan
    precioMensual,
    duracionMeses,
    ingresoISO,
    terminoISO,

    // catalogs placeholders
    escNombre,
    carNombre,
    plaNombre,

    // forms
    payDate,
    setPayDate,
    payMethod,
    setPayMethod,

    extraConcept,
    setExtraConcept,
    extraAmount,
    setExtraAmount,
    extraDate,
    setExtraDate,
    extraMethod,
    setExtraMethod,

    // data
    alumnoPayments,
    projection,
    totals,

    // actions
    addMensualidadPayment,
    addExtraPayment,
    togglePaymentStatus,
    removePayment,
    printReceipt,
  };
}
