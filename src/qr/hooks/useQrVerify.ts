'use client';

import { useCallback, useMemo, useState } from 'react';
import { decodeReceiptQr } from '../utils/qr.codec';
import { createReceiptService } from '@/modules/receipts/services/receipt.service';
import type { Receipt } from '@/modules/receipts/types/receipt.types';

export type QrVerifyState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'invalid' }
  | { kind: 'not_found'; folio: string }
  | { kind: 'valid'; receipt: Receipt }
  | { kind: 'cancelled'; receipt: Receipt }
  | { kind: 'error'; message: string };

export function useQrVerify() {
  const api = useMemo(() => createReceiptService(), []);
  const [state, setState] = useState<QrVerifyState>({ kind: 'idle' });

  const verify = useCallback(
    async (raw: string) => {
      try {
        const decoded = decodeReceiptQr(raw);
        if (!decoded) {
          setState({ kind: 'invalid' });
          return;
        }

        setState({ kind: 'loading' });

        const receipt = await api.getByFolio(decoded.folio);

        if (!receipt) {
          setState({ kind: 'not_found', folio: decoded.folio });
          return;
        }

        if (receipt.status === 'CANCELLED') {
          setState({ kind: 'cancelled', receipt });
          return;
        }

        setState({ kind: 'valid', receipt });
      } catch (e: any) {
        setState({ kind: 'error', message: e?.message ?? 'Error al verificar' });
      }
    },
    [api]
  );

  const reset = useCallback(() => setState({ kind: 'idle' }), []);

  return { state, verify, reset };
}
