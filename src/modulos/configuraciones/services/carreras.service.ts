// src/modules/configuraciones/catalogos/carreras/services/carreras.service.ts

import { api } from '@/lib/api/api.client';
import type { Carrera, CarreraCreate, CarreraUpdate } from '../types/carreras.types';

const base = '/api/catalogos/carreras';

export const CarrerasService = {
  getById(carreraId: string) {
    return api<Carrera>(`${base}/${encodeURIComponent(carreraId)}`);
  },

  list(params?: { soloActivos?: boolean }) {
    const qs =
      typeof params?.soloActivos === 'boolean'
        ? `?soloActivos=${params.soloActivos}`
        : '';
    return api<Carrera[]>(`${base}${qs}`);
  },

  create(payload: CarreraCreate) {
    return api<Carrera>(base, { method: 'POST', body: payload });
  },

  update(carreraId: string, payload: CarreraUpdate) {
    return api<Carrera>(`${base}/${encodeURIComponent(carreraId)}`, {
      method: 'PUT',
      body: payload,
    });
  },

  desactivar(carreraId: string) {
    return api<{ ok?: boolean }>(`${base}/${encodeURIComponent(carreraId)}/desactivar`, {
      method: 'PATCH',
    });
  },

  activar(carreraId: string) {
    return api<{ ok?: boolean }>(`${base}/${encodeURIComponent(carreraId)}/activar`, {
      method: 'PATCH',
    });
  },

  listByEscolaridad(escolaridadId: number, params?: { soloActivos?: boolean }) {
    const qs =
      typeof params?.soloActivos === 'boolean'
        ? `?soloActivos=${params.soloActivos}`
        : '';
    return api<Carrera[]>(
      `${base}/por-escolaridad/${encodeURIComponent(String(escolaridadId))}${qs}`,
    );
  },
};
