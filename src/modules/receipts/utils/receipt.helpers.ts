import { moneyToWordsMXN } from './money-words.mx';
import type { Receipt, ReceiptCreateInput, ReceiptQuery, ReceiptStatus } from '../types/receipt.types';

export function padFolio(n: number, size = 6) {
  return String(n).padStart(size, '0'); // 000001
}

export function buildFolio(seq: number, prefix?: string) {
  const core = padFolio(seq);
  return prefix ? `${prefix}-${core}` : core;
}

export function nowIso() {
  return new Date().toISOString();
}

export function normalizeText(s: string) {
  return (s ?? '')
    .toString()
    .trim()
    .toLowerCase();
}

export function inRangeDate(dateISO: string, from?: string, to?: string) {
  // dateISO y from/to: "YYYY-MM-DD"
  if (!dateISO) return false;
  if (from && dateISO < from) return false;
  if (to && dateISO > to) return false;
  return true;
}

export function matchesQuery(r: Receipt, q?: string) {
  if (!q) return true;
  const t = normalizeText(q);

  const haystack = [
    r.folio,
    r.alumno?.nombre ?? '',
    r.alumno?.matricula ?? '',
    r.concepto ?? '',
    String(r.monto ?? ''),
    r.fechaPago ?? '',
  ]
    .map(normalizeText)
    .join(' | ');

  return haystack.includes(t);
}

export function applyFilters(list: Receipt[], query?: ReceiptQuery) {
  if (!query) return list;

  const status = query.status ?? 'ALL';
  const folio = query.folio?.trim();

  return list.filter((r) => {
    if (folio && r.folio !== folio) return false;

    if (status !== 'ALL' && r.status !== status) return false;

    if (!inRangeDate(r.fechaPago, query.dateFrom, query.dateTo)) {
      // si no mandan rango, inRangeDate regresa true
      if (query.dateFrom || query.dateTo) return false;
    }

    if (!matchesQuery(r, query.q)) return false;

    return true;
  });
}

export function createReceiptFromInput(opts: {
  folio: string;
  input: ReceiptCreateInput;
}): Receipt {
  const ts = nowIso();

  const monto = Number(opts.input.monto ?? 0);
  return {
    folio: opts.folio,

    alumno: {
      nombre: opts.input.alumnoNombre.trim(),
      matricula: opts.input.alumnoMatricula?.trim() || undefined,
    },

    concepto: opts.input.concepto.trim(),
    monto,
    montoLetras: moneyToWordsMXN(monto),
    fechaPago: opts.input.fechaPago,

    status: 'VALID',

    createdAt: ts,
    updatedAt: ts,
  };
}

export function markCancelled(r: Receipt, reason: string): Receipt {
  const ts = nowIso();
  return {
    ...r,
    status: 'CANCELLED' satisfies ReceiptStatus,
    cancelReason: reason.trim(),
    cancelledAt: ts,
    updatedAt: ts,
  };
}
