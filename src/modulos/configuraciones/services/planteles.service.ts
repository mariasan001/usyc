import { api } from '@/lib/api/api.client';
import type {
  Plantel,
  PlantelCreate,
  PlantelUpdate,
} from '../types/planteles.types';

const base = '/api/catalogos/planteles';

export const PlantelesService = {
  list(params?: { soloActivos?: boolean }) {
    const qs =
      typeof params?.soloActivos === 'boolean'
        ? `?soloActivos=${params.soloActivos}`
        : '';
    return api<Plantel[]>(`${base}${qs}`);
  },

  getById(id: number) {
    return api<Plantel>(`${base}/${id}`);
  },

  create(payload: PlantelCreate) {
    return api<Plantel>(base, {
      method: 'POST',
      body: payload,
    });
  },

  update(id: number, payload: PlantelUpdate) {
    return api<Plantel>(`${base}/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  delete(id: number) {
    return api<{ ok: boolean }>(`${base}/${id}`, {
      method: 'DELETE',
    });
  },
};
