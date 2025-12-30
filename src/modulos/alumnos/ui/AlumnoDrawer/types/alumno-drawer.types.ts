export type DrawerTab = 'RESUMEN' | 'PROYECCION' | 'PAGOS' | 'EXTRAS';

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

export type ProjectionRow = {
  idx: number;
  periodo: string;        // "2025-12"
  dueDate: string;        // "2025-12-01"
  conceptCode: string;    // "INSCRIPCION" | "MENSUALIDAD" | "OTRO" ...
  amount: number;
  estado: string;         // texto que venga del back
  isPaid: boolean;
  reciboId?: number;
};

export type PagoRealRow = {
  reciboId: number;
  folio: string;

  fechaEmision: string;  // ✅ viene del back
  fechaPago: string;      // ISO

  alumnoId: string;      // ✅ viene del back
  alumnoNombre?: string;

  concepto: string;
  monto: number;
  moneda: string;

  estatusCodigo: string;
  estatusNombre: string;

  tipoPagoId: number;
  tipoPagoCodigo: string;
  tipoPagoNombre: string;

  cancelado: boolean;

  qrPayload: string;
  qrPayLoad: string; // ✅ por inconsistencia del back
};

export type Totals = {
  totalPlan: number;
  totalPagado: number;
  saldo: number;

  pagados: number;
  pendientes: number;
  vencidos: number;

  // ✅ nuevo: extras (opcional)
  totalExtras?: number;
};
