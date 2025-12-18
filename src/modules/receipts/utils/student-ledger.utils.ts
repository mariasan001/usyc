import type { Receipt } from '../types/receipt.types';

export type StudentRef = {
  nombre: string;
  matricula?: string | null;
};

export type PlanConfig = {
  startDate: string;      // YYYY-MM-DD
  durationMonths: number; // 6 | 12 | 24 | 36 | 48
  monthlyAmount: number;  // esperado por mes
};

export type PlanRow = {
  key: string; // YYYY-MM
  periodoLabel: string; // "DICIEMBRE DE 2025"
  concepto: string;
  montoEsperado: number;
  estado: 'PAGADO' | 'PENDIENTE';
  fechaPago?: string;
  folioPago?: string;
};

const MONTHS_ES = [
  'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
  'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE',
];

function toKeyYYYYMM(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function labelUpper(d: Date) {
  const m = MONTHS_ES[d.getMonth()];
  const y = d.getFullYear();
  return `${m} DE ${y}`;
}

function addMonths(base: Date, n: number) {
  const d = new Date(base);
  d.setMonth(d.getMonth() + n);
  return d;
}

export function inferStartDate(studentReceipts: Receipt[], fallback = new Date()) {
  const valid = studentReceipts
    .filter((r) => r.status === 'VALID' && r.fechaPago)
    .sort((a, b) => (a.fechaPago ?? '').localeCompare(b.fechaPago ?? ''));

  if (valid[0]?.fechaPago) return valid[0].fechaPago; // YYYY-MM-DD
  return fallback.toISOString().slice(0, 10);
}

export function inferMonthlyAmount(studentReceipts: Receipt[], fallback = 0) {
  // usa el último pago válido como referencia (si existe)
  const valid = studentReceipts
    .filter((r) => r.status === 'VALID')
    .sort((a, b) => (a.fechaPago ?? '').localeCompare(b.fechaPago ?? ''));

  const last = valid[valid.length - 1];
  return typeof last?.monto === 'number' ? last.monto : fallback;
}

export function buildPlan(cfg: PlanConfig): PlanRow[] {
  const start = new Date(cfg.startDate);
  start.setDate(1); // normalizamos al primer día del mes

  return Array.from({ length: cfg.durationMonths }).map((_, i) => {
    const d = addMonths(start, i);
    const key = toKeyYYYYMM(d);

    return {
      key,
      periodoLabel: labelUpper(d),
      concepto: i === 0 ? `COLEGIATURA ${labelUpper(d)}` : 'Colegiatura',
      montoEsperado: cfg.monthlyAmount,
      estado: 'PENDIENTE',
      fechaPago: undefined,
      folioPago: undefined,
    };
  });
}

export function applyReceiptsToPlan(rows: PlanRow[], studentReceipts: Receipt[]): PlanRow[] {
  // Map: YYYY-MM => recibo válido más reciente del mes
  const map = new Map<string, Receipt>();

  for (const r of studentReceipts) {
    if (r.status !== 'VALID') continue;
    if (!r.fechaPago) continue;

    const key = r.fechaPago.slice(0, 7); // YYYY-MM
    const prev = map.get(key);

    if (!prev) map.set(key, r);
    else {
      // si hay varios, nos quedamos con el más reciente por fecha
      const prevDate = prev.fechaPago ?? '';
      const nextDate = r.fechaPago ?? '';
      if (nextDate > prevDate) map.set(key, r);
    }
  }

  return rows.map((row) => {
    const paid = map.get(row.key);
    if (!paid) return row;

    return {
      ...row,
      estado: 'PAGADO',
      fechaPago: paid.fechaPago,
      folioPago: paid.folio,
    };
  });
}

export function calcLedgerSummary(rows: PlanRow[]) {
  const totalEsperado = rows.reduce((acc, r) => acc + (r.montoEsperado ?? 0), 0);
  const pagados = rows.filter((r) => r.estado === 'PAGADO');
  const totalPagado = pagados.reduce((acc, r) => acc + (r.montoEsperado ?? 0), 0);
  const deuda = Math.max(0, totalEsperado - totalPagado);
  const progreso = totalEsperado > 0 ? Math.round((totalPagado / totalEsperado) * 100) : 0;

  return { totalEsperado, totalPagado, deuda, progreso };
}

export function calcEstimatedEndDate(cfg: PlanConfig) {
  const start = new Date(cfg.startDate);
  start.setDate(1);
  const end = addMonths(start, Math.max(0, cfg.durationMonths - 1));
  return labelUpper(end);
}


