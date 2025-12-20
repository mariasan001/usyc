import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';

export type ReciboCreatePayload = {
  alumnoId: string;
  concepto: string;        // "INSCRIPCION" | "MENSUALIDAD" | "OTRO"
  montoManual: number;     // ✅ SIEMPRE > 0
  fechaPago: string;       // "YYYY-MM-DD"
  tipoPagoId: number;      // ✅ NUEVO
  comentario?: string;
};

export const RecibosService = {
  // POST /api/recibos
  create: (payload: ReciboCreatePayload) =>
    api(API.recibos.base, { method: 'POST', body: payload }),
};
