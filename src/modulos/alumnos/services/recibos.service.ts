import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import { ReciboCreateRequest, ReciboCreateResponse } from '../ui/AlumnoDrawer/types/recibos.types';

export const RecibosService = {
  // POST /api/recibos
  create: (payload: ReciboCreateRequest) => {
    // “metodo” no existe aún en el back: no lo mandamos para evitar 400/500 raros.
    const { metodo, ...body } = payload;

    return api<ReciboCreateResponse>(API.recibos.base, {
      method: 'POST',
      body,
    });
  },
};
