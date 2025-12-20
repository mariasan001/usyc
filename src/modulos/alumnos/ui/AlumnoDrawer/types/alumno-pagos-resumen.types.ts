export type AlumnoPagosResumen = {
  alumnoId: string;
  alumnoNombre: string;

  carreraId: string;
  carreraNombre: string;

  fechaIngreso: string;   // YYYY-MM-DD
  fechaTermino: string;   // YYYY-MM-DD

  montoMensual: number;
  montoInscripcion: number;

  totalPagado: number;
  totalProyectado: number;
  saldoPendiente: number;

  pagosReales: PagoReal[];
  proyeccion: ProyeccionPago[];
};

export type PagoReal = {
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
  qrPayload?: string;
};

export type ProyeccionPago = {
  periodo: string;          // libre (como venga del back)
  fechaVencimiento: string; // YYYY-MM-DD
  conceptoCodigo: string;
  monto: number;
  estado: string;           // si el back define catálogo luego lo estrechamos a union
};
