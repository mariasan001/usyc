import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import type { QrVerifyResponse } from '../types/qr-verify.types';

export const QrVerifyService = {
  verify(qrPayload: string) {
    return api<QrVerifyResponse>(API.recibos.validarQr(qrPayload));
  },
};
