export type ReciboCanceladoDTO = {
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

  tipoPagoId?: number | null;
  tipoPagoCode?: string | null;
  tipoPagoName?: string | null;

  cancelado: boolean;

  // Swagger a veces lo muestra como "qrPayLoad"
  qrPayLoad?: string | null;
};

export type ReciboCanceladoRow = {
  reciboId: number;
  folio: string;
  folioLegacy: string | null;

  fechaEmision: string;
  fechaPago: string;

  alumnoId: string;
  alumnoNombre: string;

  concepto: string;
  monto: number;
  moneda: string;

  estatusCodigo: string;
  estatusNombre: string;

  tipoPagoName: string | null;

  cancelado: boolean;
  qrPayload: string;
};
