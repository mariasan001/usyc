import type { Receipt, ReceiptCreateInput, ReceiptQuery } from '../types/receipt.types';
import type { ReceiptService } from './receipt.service';
import { STORAGE_KEYS } from '@/shared/constants/app.constants';
import { applyFilters, buildFolio, createReceiptFromInput, markCancelled, nowIso } from '../utils/receipt.helpers';

type StoreShape = {
  receipts: Receipt[];
  seq: number;
  seeded?: boolean;
};

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readStore(): StoreShape {
  if (typeof window === 'undefined') {
    return { receipts: [], seq: 0, seeded: true };
  }

  const receipts = safeParse<Receipt[]>(
    window.localStorage.getItem(STORAGE_KEYS.receipts),
    []
  );

  const seq = safeParse<number>(
    window.localStorage.getItem(STORAGE_KEYS.receiptSeq),
    0
  );

  const seeded = safeParse<boolean>(
    window.localStorage.getItem(`${STORAGE_KEYS.receipts}_seeded`),
    false
  );

  return { receipts, seq, seeded };
}

function writeStore(store: StoreShape) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(STORAGE_KEYS.receipts, JSON.stringify(store.receipts));
  window.localStorage.setItem(STORAGE_KEYS.receiptSeq, JSON.stringify(store.seq));
  window.localStorage.setItem(`${STORAGE_KEYS.receipts}_seeded`, JSON.stringify(Boolean(store.seeded)));
}

function sortByNewest(a: Receipt, b: Receipt) {
  // más nuevo primero: por fechaPago, luego createdAt
  if (a.fechaPago !== b.fechaPago) return a.fechaPago < b.fechaPago ? 1 : -1;
  return a.createdAt < b.createdAt ? 1 : -1;
}

function seedIfNeeded(store: StoreShape): StoreShape {
  if (store.seeded) return store;

  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const base: Receipt[] = [
    {
      folio: buildFolio(1),
      alumno: { nombre: 'Juan Pérez', matricula: 'A001' },
      concepto: 'Inscripción',
      monto: 950,
      montoLetras: 'NOVECIENTOS CINCUENTA PESOS 00/100 M.N.',
      fechaPago: iso(today),
      status: 'VALID',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      folio: buildFolio(2),
      alumno: { nombre: 'María López', matricula: 'A002' },
      concepto: 'Colegiatura',
      monto: 1200.5,
      montoLetras: 'MIL DOSCIENTOS PESOS 50/100 M.N.',
      fechaPago: iso(new Date(today.getTime() - 86400000)),
      status: 'CANCELLED',
      cancelReason: 'Pago duplicado',
      cancelledAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];

  const nextSeq = Math.max(store.seq, 2);

  return {
    receipts: [...base, ...store.receipts].sort(sortByNewest),
    seq: nextSeq,
    seeded: true,
  };
}

export class LocalReceiptService implements ReceiptService {
  private folioPrefix?: string;

  constructor(opts?: { folioPrefix?: string }) {
    this.folioPrefix = opts?.folioPrefix; // si algún día quieres: "USYC"
  }

  async list(q?: ReceiptQuery): Promise<Receipt[]> {
    let store = readStore();
    store = seedIfNeeded(store);
    writeStore(store);

    const filtered = applyFilters(store.receipts, q);
    return [...filtered].sort(sortByNewest);
  }

  async getByFolio(folio: string): Promise<Receipt | null> {
    let store = readStore();
    store = seedIfNeeded(store);
    writeStore(store);

    return store.receipts.find((r) => r.folio === folio) ?? null;
  }

  async create(input: ReceiptCreateInput): Promise<Receipt> {
    const store = readStore();
    const nextSeq = (store.seq ?? 0) + 1;

    const folio = buildFolio(nextSeq, this.folioPrefix);
    const receipt = createReceiptFromInput({ folio, input });

    const next: StoreShape = {
      receipts: [receipt, ...(store.receipts ?? [])].sort(sortByNewest),
      seq: nextSeq,
      seeded: true,
    };

    writeStore(next);
    return receipt;
  }

  async cancel(folio: string, reason: string): Promise<Receipt> {
    const store = readStore();
    const r = store.receipts.find((x) => x.folio === folio);

    if (!r) throw new Error('Recibo no encontrado');
    if (r.status === 'CANCELLED') return r;
    if (!reason?.trim()) throw new Error('Motivo obligatorio');

    const updated = markCancelled(r, reason);

    const nextReceipts = store.receipts.map((x) => (x.folio === folio ? updated : x));
    writeStore({ receipts: nextReceipts, seq: store.seq, seeded: true });

    return updated;
  }
}
