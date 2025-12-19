// src/modules/configuraciones/catalogos/escolaridades/services/escolaridades.service.ts
import { api } from '@/lib/api/api.client';
import type {
  Escolaridad,
  EscolaridadCreate,
  EscolaridadUpdate,
} from '../types/escolaridades.types';

const base = '/api/catalogos/escolaridades';

export const EscolaridadesService = {
  getById(id: number) {
    return api<Escolaridad>(`${base}/${id}`);
  },

  list(params?: { soloActivos?: boolean }) {
    const qs =
      typeof params?.soloActivos === 'boolean'
        ? `?soloActivos=${params.soloActivos}`
        : '';
    return api<Escolaridad[]>(`${base}${qs}`);
  },

  create(payload: EscolaridadCreate) {
    return api<Escolaridad>(base, { method: 'POST', body: payload });
  },

  update(id: number, payload: EscolaridadUpdate) {
    return api<Escolaridad>(`${base}/${id}`, { method: 'PUT', body: payload });
  },

  desactivar(id: number) {
    return api<{ ok?: boolean }>(`${base}/${id}/desactivar`, { method: 'PATCH' });
  },

  activar(id: number) {
    return api<{ ok?: boolean }>(`${base}/${id}/activar`, { method: 'PATCH' });
  },

  getByCodigo(codigo: string) {
    return api<Escolaridad>(`${base}/por-codigo/${encodeURIComponent(codigo)}`);
  },
};
