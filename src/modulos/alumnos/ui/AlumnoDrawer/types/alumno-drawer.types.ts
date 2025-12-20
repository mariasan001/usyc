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
  fechaPago: string;      // ISO
  concepto: string;       // concepto/codigo/label
  monto: number;
  moneda: string;         // "MXN"
  estatusCodigo?: string; // por si llega código
  estatusNombre?: string; // por si llega label
  cancelado: boolean;
};

export type Totals = {
  totalPlan: number;
  totalPagado: number;
  saldo: number;

  totalInscripcion: number;

  pagados: number;
  pendientes: number;
  vencidos: number;

  nextDue: ProjectionRow | null;
};
