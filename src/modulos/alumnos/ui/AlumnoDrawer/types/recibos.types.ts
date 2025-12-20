export type ReciboCreateDTO = {
  alumnoId: string;
  concepto: string;       // INSCRIPCION | MENSUALIDAD | OTRO | etc
  montoManual?: number;   // requerido si concepto === OTRO
  fechaPago: string;      // YYYY-MM-DD
  comentario?: string;
  // metodo?: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' (listo para el futuro)
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
