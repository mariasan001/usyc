// src/modulos/alumnos/services/recibos.service.ts
import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import { API_BASE_URL } from '@/lib/api/api.config';

import type { ReciboCreateDTO, ReciboDTO } from '@/modulos/alumnos/ui/AlumnoDrawer/types/recibos.types';

export const RecibosService = {
  // POST /api/recibos
  create: (payload: ReciboCreateDTO) =>
    api<ReciboDTO>(API.recibos.create, { method: 'POST', body: payload }),

  // ✅ URL del QR (GET como imagen/png, se usa en <img src="...">)
  qrUrl: (reciboId: number) => `${API_BASE_URL}${API.recibos.qr(reciboId)}`,
};
