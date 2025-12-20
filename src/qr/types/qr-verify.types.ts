export type QrVerifyEstado = 'VALIDO' | 'CANCELADO' | 'NO_ENCONTRADO' | 'ALTERADO';

export type QrVerifyRecibo = {
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

  tipoPagoId: number;
  tipoPagoCodigo: string;
  tipoPagoNombre: string;

  cancelado: boolean;
  qrPayload: string; // lo que regresa el endpoint validar
};

export type QrVerifyResponse = {
  estado: QrVerifyEstado;
  mensaje: string;
  recibo?: QrVerifyRecibo;
};
