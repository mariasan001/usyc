import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import { ReciboCreateDTO, ReciboDTO } from '../ui/AlumnoDrawer/types/recibos.types';


export const RecibosService = {
  create: (payload: ReciboCreateDTO) =>
    api<ReciboDTO>(API.recibos.create, {
      method: 'POST',
      body: payload,
    }),

  getById: (reciboId: number, args?: { signal?: AbortSignal }) =>
    api<ReciboDTO>(API.recibos.byId(reciboId), { signal: args?.signal }),

  qrUrl: (reciboId: number) =>
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recibos/${reciboId}/qr`,
};
