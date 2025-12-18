import type { Receipt, ReceiptCreateInput, ReceiptQuery } from '../types/receipt.types';
import type { ReceiptService } from './receipt.service';

function qs(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) sp.set(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export class ApiReceiptService implements ReceiptService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

  private url(path: string) {
    return `${this.baseUrl}${path}`;
  }

  async list(q?: ReceiptQuery): Promise<Receipt[]> {
    const query = qs({
      q: q?.q,
      status: q?.status && q.status !== 'ALL' ? q.status : undefined,
      dateFrom: q?.dateFrom,
      dateTo: q?.dateTo,
      folio: q?.folio,
    });

    const res = await fetch(this.url(`/receipts${query}`), { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar recibos');
    return (await res.json()) as Receipt[];
  }

  async getByFolio(folio: string): Promise<Receipt | null> {
    const res = await fetch(this.url(`/receipts/${encodeURIComponent(folio)}`), { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Error al consultar recibo');
    return (await res.json()) as Receipt;
  }

  async create(input: ReceiptCreateInput): Promise<Receipt> {
    const res = await fetch(this.url('/receipts'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Error al crear recibo');
    return (await res.json()) as Receipt;
  }

  async cancel(folio: string, reason: string): Promise<Receipt> {
    const res = await fetch(this.url(`/receipts/${encodeURIComponent(folio)}/cancel`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Error al cancelar recibo');
    return (await res.json()) as Receipt;
  }
}
