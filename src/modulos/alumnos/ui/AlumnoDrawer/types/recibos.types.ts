export type ReciboCreateDTO = {
  alumnoId: string;
  concepto: string;      // INSCRIPCION | MENSUALIDAD | OTRO | etc
  montoManual: number;   // ✅ SIEMPRE, nunca 0
  fechaPago: string;     // YYYY-MM-DD
  tipoPagoId: number;    // ✅ SIEMPRE
  comentario?: string;
};

export type ReciboDTO = {
  reciboId: number;
  folio: string;
  fechaEmision: string;
  fechaPago: string;
  alumnoId: string;
  alumnoNombre: string;
  concepto: string;
  monto: number;
  moneda: string;
  estatusCodigo: string;
  estatusNombre: string;
  cancelado: boolean;
  qrPayload?: string;
};
