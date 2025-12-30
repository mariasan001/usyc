export type PagoRealDTO = {
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

  // ✅ vienen en tu JSON real
  tipoPagoId: number;
  tipoPagoCodigo: string;
  tipoPagoNombre: string;

  cancelado: boolean;

  // ✅ a veces llega como qrPayload o qrPayLoad (backend inconsistente)
  qrPayload: string;
  qrPayLoad: string;
};


export type ProyeccionDTO = {
  periodo: string;
  fechaVencimiento: string; // YYYY-MM-DD
  conceptoCodigo: string;
  monto: number;
  estado: string; // lo que mande back (PENDIENTE / PAGADO / etc.)
};

export type AlumnoPagosResumenDTO = {
  alumnoId: string;
  alumnoNombre: string;

  carreraId: string;
  carreraNombre: string;

  fechaIngreso: string; // YYYY-MM-DD
  fechaTermino: string; // YYYY-MM-DD

  montoMensual: number;
  montoInscripcion: number;

  totalPagado: number;
  totalProyectado: number;
  saldoPendiente: number;

  pagosReales: PagoRealDTO[];
  proyeccion: ProyeccionDTO[];
};
