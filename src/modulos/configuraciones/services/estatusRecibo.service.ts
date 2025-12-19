// src/modules/configuraciones/catalogos/services/estatusRecibo.service.ts
import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import type { EstatusRecibo, EstatusReciboCreate, EstatusReciboUpdate } from '../types/estatusRecibo.types';

type ListParams = { soloActivos?: boolean };

export const EstatusReciboService = {
  list: (params?: ListParams) => {
    const qs =
      typeof params?.soloActivos === 'boolean'
        ? `?soloActivos=${params.soloActivos}`
        : '';

    return api<EstatusRecibo[]>(`${API.catalogos.estatusRecibo}${qs}`);
  },

  getById: (id: number) =>
    api<EstatusRecibo>(`${API.catalogos.estatusRecibo}/${id}`),

  getByCodigo: (codigo: string) =>
    api<EstatusRecibo>(
      `${API.catalogos.estatusRecibo}/por-codigo/${encodeURIComponent(codigo)}`,
    ),

  create: (payload: EstatusReciboCreate) =>
    api<EstatusRecibo>(API.catalogos.estatusRecibo, { method: 'POST', body: payload }),

  update: (id: number, payload: EstatusReciboUpdate) =>
    api<EstatusRecibo>(`${API.catalogos.estatusRecibo}/${id}`, { method: 'PUT', body: payload }),

  // ✅ Si tu back los tiene (como escolaridades/carreras), deja esto:
  activar: (id: number) =>
    api<{ ok?: boolean }>(`${API.catalogos.estatusRecibo}/${id}/activar`, { method: 'PATCH' }),

  desactivar: (id: number) =>
    api<{ ok?: boolean }>(`${API.catalogos.estatusRecibo}/${id}/desactivar`, { method: 'PATCH' }),
};
