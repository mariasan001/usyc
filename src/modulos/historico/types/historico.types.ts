export type ReciboHistoricoDTO = {
  reciboId: number;
  folio: string;
  folioLegacy?: string | null;

  fechaEmision: string; // YYYY-MM-DD
  fechaPago: string; // YYYY-MM-DD

  alumnoId: string;
  alumnoNombre: string;

  concepto: string;
  monto: number;
  moneda: string;

  estatusCodigo: string;
  estatusNombre: string;

  tipoPagoId: number;
  tipoPagoCode: string;
  tipoPagoName: string;

  cancelado: boolean;
  qrPayload: string;
};
