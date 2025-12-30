// src/modulos/alumnos/ui/AlumnoDrawer/types/pagos-reales.dto.ts
import type { ReciboConcepto } from './recibos.types';

export type PagoRealDTO = {
  reciboId: number;
  folio: string;

  // tu screenshot trae fechaPago seguro; fechaEmision puede o no venir
  fechaPago: string;         // ISO / YYYY-MM-DD
  fechaEmision?: string;

  alumnoId?: string;
  alumnoNombre?: string;

  // el back puede mandar string; si es consistente, cámbialo a ReciboConcepto
  concepto: ReciboConcepto | string;

  monto: number;
  moneda: string;

  estatusCodigo?: string;
  estatusNombre: string;

  tipoPagoId?: number;
  tipoPagoCodigo?: string;
  tipoPagoNombre?: string;

  cancelado: boolean;

  qrPayload?: string;
  qrPayLoad?: string; // inconsistencia del back
};
