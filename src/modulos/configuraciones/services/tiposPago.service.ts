import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';

import type {
  TipoPago,
  TipoPagoCreate,
  TipoPagoUpdate,
} from '../types/tiposPago.types';

export const tiposPagoService = {
  // GET /api/catalogos/tipos-pago?soloActivos=true|false
  list: (args?: { soloActivos?: boolean; signal?: AbortSignal }) => {
    const soloActivos = args?.soloActivos ?? true;
    const qs = new URLSearchParams({ soloActivos: String(soloActivos) });
    return api<TipoPago[]>(
      `${API.catalogos.tiposPago}?${qs.toString()}`,
      { signal: args?.signal },
    );
  },

  // POST /api/catalogos/tipos-pago
  create: (payload: TipoPagoCreate) =>
    api<TipoPago>(API.catalogos.tiposPago, {
      method: 'POST',
      body: payload,
    }),

  // PUT /api/catalogos/tipos-pago/{id}
  update: (id: number, payload: TipoPagoUpdate) =>
    api<TipoPago>(API.catalogos.tipoPagoById(id), {
      method: 'PUT',
      body: payload,
    }),

  // DELETE /api/catalogos/tipos-pago/{id}
  remove: (id: number) =>
    api<void>(API.catalogos.tipoPagoById(id), {
      method: 'DELETE',
    }),
};
