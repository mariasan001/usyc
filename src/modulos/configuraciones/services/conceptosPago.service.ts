import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import type {
  ConceptoPago,
  ConceptoPagoCreate,
  ConceptoPagoUpdate,
} from '../types/conceptosPago.types';

function withSoloActivos(path: string, soloActivos?: boolean) {
  if (soloActivos === undefined) return path;
  const qs = new URLSearchParams({ soloActivos: String(soloActivos) });
  return `${path}?${qs.toString()}`;
}

export const conceptosPagoService = {
  list: (args: { soloActivos?: boolean; signal?: AbortSignal } = {}) =>
    api<ConceptoPago[]>(withSoloActivos(API.catalogos.conceptosPago, args.soloActivos), {
      method: 'GET',
      signal: args.signal,
    }),

  getById: (conceptoId: number, signal?: AbortSignal) =>
    api<ConceptoPago>(API.catalogos.conceptoPagoById(conceptoId), {
      method: 'GET',
      signal,
    }),

  getByCodigo: (codigo: string, signal?: AbortSignal) =>
    api<ConceptoPago>(API.catalogos.conceptoPagoByCodigo(codigo), {
      method: 'GET',
      signal,
    }),

  create: (payload: ConceptoPagoCreate) =>
    api<ConceptoPago>(API.catalogos.conceptosPago, {
      method: 'POST',
      body: payload,
    }),

  update: (conceptoId: number, payload: ConceptoPagoUpdate) =>
    api<ConceptoPago>(API.catalogos.conceptoPagoById(conceptoId), {
      method: 'PUT',
      body: payload,
    }),

  activar: (conceptoId: number) =>
    api<void>(API.catalogos.conceptoPagoActivar(conceptoId), {
      method: 'PATCH',
    }),

  desactivar: (conceptoId: number) =>
    api<void>(API.catalogos.conceptoPagoDesactivar(conceptoId), {
      method: 'PATCH',
    }),
};
