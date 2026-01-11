export type ReciboCreateDTO = {
  alumnoId: string;

  // ✅ ahora es libre, el back valida
  concepto: string;

  montoManual: number;
  fechaPago: string; // YYYY-MM-DD
  tipoPagoId: number;
  comentario?: string;
};
export type ReciboDTOApi = {
  reciboId: number;
  folio: string;

  fechaEmision: string; // YYYY-MM-DD
  fechaPago: string; // YYYY-MM-DD

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

// src/modulos/alumnos/ui/AlumnoDrawer/types/recibos.types.ts

export type ReciboDTO = {
  reciboId: number;
  folio: string;
  fechaEmision: string; // YYYY-MM-DD
  fechaPago: string;    // YYYY-MM-DD

  alumnoId: string;
  alumnoNombre: string;

  // ✅ extras útiles para impresión (cache)
  matricula?: string;
  carreraNombre?: string;
  plantelNombre?: string;

  concepto: string;
  monto: number;
  moneda: string;

  estatusCodigo: string;
  estatusNombre: string;

  cancelado: boolean;

  qrPayload?: string;
};
