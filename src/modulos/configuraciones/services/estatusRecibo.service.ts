import { api } from '@/lib/api/api.client';
import type {
  EstatusRecibo,
  EstatusReciboCreate,
  EstatusReciboUpdate,
} from '../types/estatusRecibo.types';

const base = '/api/catalogos/estatus-recibo';

export const estatusReciboService = {
  list: (args: { signal?: AbortSignal } = {}) =>
    api<EstatusRecibo[]>(base, {
      method: 'GET',
      signal: args.signal,
    }),

  getById: (id: number, signal?: AbortSignal) =>
    api<EstatusRecibo>(`${base}/${id}`, {
      method: 'GET',
      signal,
    }),

  getByCodigo: (codigo: string, signal?: AbortSignal) =>
    api<EstatusRecibo>(`${base}/por-codigo/${encodeURIComponent(codigo)}`, {
      method: 'GET',
      signal,
    }),

  create: (payload: EstatusReciboCreate) =>
    api<EstatusRecibo>(base, {
      method: 'POST',
      body: payload,
    }),

  update: (id: number, payload: EstatusReciboUpdate) =>
    api<EstatusRecibo>(`${base}/${id}`, {
      method: 'PUT',
      body: payload,
    }),
};
