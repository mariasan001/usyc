export type ReciboConcepto = 'INSCRIPCION' | 'MENSUALIDAD' | 'OTRO';

export type ReciboCreateDTO = {
  alumnoId: string;
  concepto: ReciboConcepto;
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

export type ReciboDTO = {
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

  cancelado: boolean;

  // ✅ opcional por inconsistencias
  qrPayload?: string;

  // ✅ SOLO para impresión (se cachea desde el drawer)
  matricula?: string;
  carreraNombre?: string;
};
