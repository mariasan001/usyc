// src/modulos/alumnos/services/recibos.service.ts
import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import type { ReciboCreateDTO, ReciboDTO } from '@/modulos/alumnos/ui/AlumnoDrawer/types/recibos.types';

export const RecibosService = {
  create: (payload: ReciboCreateDTO) =>
    api<ReciboDTO>(API.recibos.create, {
      method: 'POST',
      body: payload,
    }),

  // ✅ URL del QR (el único GET real que sí usas)
  qrUrl: (reciboId: number) =>
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recibos/${reciboId}/qr`,
};
