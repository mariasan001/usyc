import type { Receipt, ReceiptCreateInput, ReceiptQuery } from '../types/receipt.types';
import { LocalReceiptService } from './receipt.local.service';
import { ApiReceiptService } from './receipt.api.service';

export type ReceiptService = {
  list(q?: ReceiptQuery): Promise<Receipt[]>;
  getByFolio(folio: string): Promise<Receipt | null>;
  create(input: ReceiptCreateInput): Promise<Receipt>;
  cancel(folio: string, reason: string): Promise<Receipt>;
};

export function createReceiptService(): ReceiptService {
  const mode = process.env.NEXT_PUBLIC_DATA_MODE ?? 'local'; // local | api
  return mode === 'api' ? new ApiReceiptService() : new LocalReceiptService();
}
