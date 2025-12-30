// src/modulos/alumnos/ui/AlumnoDrawer/types/recibos.types.ts

export type ReciboConcepto = 'INSCRIPCION' | 'MENSUALIDAD' | 'OTRO';

export type ReciboCreateDTO = {
  alumnoId: string;
  concepto: ReciboConcepto;
  montoManual: number;     // ✅ requerido cuando concepto = 'OTRO'
  fechaPago: string;       // YYYY-MM-DD
  tipoPagoId: number;      // ✅ requerido
  comentario?: string;     // ✅ aquí guardamos "Curso de verano"
};

export type ReciboDTOApi = {
  reciboId: number;
  folio: string;

  fechaEmision: string; // YYYY-MM-DD
  fechaPago: string;    // YYYY-MM-DD

  alumnoId: string;
  alumnoNombre: string;

  concepto: string;
  monto: number;
  moneda: string;

  estatusCodigo: string;
  estatusNombre: string;

  tipoPagoId?: number;
  tipoPagoCodigo?: string;
  tipoPagoNombre?: string;

  cancelado: boolean;

  // backend inconsistente
  qrPayload?: string;
  qrPayLoad?: string;
};

export type ReciboDTO = {
  reciboId: number;
  folio: string;
  fechaEmision: string; // YYYY-MM-DD
  fechaPago: string;    // YYYY-MM-DD
  alumnoId: string;
  alumnoNombre: string;

  concepto: string;
  monto: number;
  moneda: string;

  estatusCodigo: string;
  estatusNombre: string;

  cancelado: boolean;

  // ✅ antes era string (obligatorio)
  // qrPayload: string;

  // ✅ ahora:
  qrPayload?: string;
};