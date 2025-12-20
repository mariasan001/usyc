// src/modulos/alumnos/services/recibos.service.ts
import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import type {
  ReciboCreateDTO,
  ReciboDTO,
} from '@/modulos/alumnos/ui/AlumnoDrawer/types/recibos.types';

// ✅ fallback sólido (si el env no existe, usamos 8000)
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export const RecibosService = {
  create: (payload: ReciboCreateDTO) =>
    api<ReciboDTO>(API.recibos.create, {
      method: 'POST',
      body: payload,
    }),

  // ✅ URL del QR (el único GET real)
  qrUrl: (reciboId: number) => `${BASE}/api/recibos/${reciboId}/qr`,
};