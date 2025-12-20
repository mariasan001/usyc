import type { PaymentItem, ProjectionItem, Totals } from '../types/alumno-drawer.types';
import { cmpISO, todayISO } from './drawer.dates';

export function buildProjection(args: {
  fechaIngreso: string;
  duracionMeses: number;
  precioMensual: number;
  alumnoPayments: PaymentItem[];
  addMonthsISO: (iso: string, months: number) => string;
}): ProjectionItem[] {
  const { fechaIngreso, duracionMeses, precioMensual, alumnoPayments, addMonthsISO } = args;

  const mensualidades = alumnoPayments.filter((p) => p.type === 'MENSUALIDAD');

  const paidByDate = new Map<string, PaymentItem>();
  for (const p of mensualidades) {
    const prev = paidByDate.get(p.date);
    if (!prev) paidByDate.set(p.date, p);
    else if (prev.createdAt < p.createdAt) paidByDate.set(p.date, p);
  }

  const out: ProjectionItem[] = [];
  for (let i = 0; i < duracionMeses; i++) {
    const due = addMonthsISO(fechaIngreso, i);
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
}

export function computeTotals(args: {
  duracionMeses: number;
  precioMensual: number;
  alumnoPayments: PaymentItem[];
  projection: ProjectionItem[];
}): Totals {
  const { duracionMeses, precioMensual, alumnoPayments, projection } = args;

  const totalPlan = precioMensual * duracionMeses;

  const extras = alumnoPayments.filter((p) => p.type === 'EXTRA');
  const totalExtras = extras.reduce((acc, p) => acc + p.amount, 0);

  const pagosPagados = alumnoPayments.filter((p) => p.status === 'PAGADO');
  const totalPagado = pagosPagados.reduce((acc, p) => acc + p.amount, 0);

  const saldo = Math.max(0, (totalPlan + totalExtras) - totalPagado);

  const pagados = projection.filter((x) => x.status === 'PAGADO').length;
  const pendientes = projection.filter((x) => x.status === 'PENDIENTE').length;

  const t = todayISO();
  const vencidos = projection.filter((x) => x.status === 'PENDIENTE' && cmpISO(x.dueDate, t) < 0).length;

  const nextDue = projection.find((x) => x.status === 'PENDIENTE') ?? null;

  return { totalPlan, totalExtras, totalPagado, saldo, pagados, pendientes, vencidos, nextDue };
}
