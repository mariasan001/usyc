'use client';

import { useCallback, useState } from 'react';
import { QrVerifyService } from '../services/qr-verify.service';
import type { QrVerifyResponse } from '../types/qr-verify.types';

export function useQrVerify() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<QrVerifyResponse | null>(null);
  const [error, setError] = useState<string>('');

  const verify = useCallback(async (qrPayload: string) => {
    setError('');
    setData(null);

    const payload = qrPayload.trim();
    if (!payload) {
      setError('Falta el qrPayload.');
      return null;
    }

    setLoading(true);
    try {
      const res = await QrVerifyService.verify(payload);
      setData(res);
      return res;
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo verificar el QR.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, data, error, verify };
}
