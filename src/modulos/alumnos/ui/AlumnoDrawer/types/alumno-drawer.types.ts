export type DrawerTab = 'RESUMEN' | 'PROYECCION' | 'PAGOS' | 'EXTRAS';

export type Totals = {
  totalPlan: number;       // totalProyectado
  totalPagado: number;     // totalPagado
  saldo: number;           // saldoPendiente
  totalInscripcion: number;

  pagados: number;
  pendientes: number;
  vencidos: number;

  nextDue: ProjectionRow | null;
};

export type ProjectionRow = {
  idx: number; // 1..N
  periodo: string;

  dueDate: string; // YYYY-MM-DD
  conceptCode: string;

  amount: number;
  estado: string;

  isPaid: boolean;
  reciboId?: number;
};

export type PagoRealRow = {
  reciboId: number;
  folio: string;
  fechaPago: string;
  concepto: string;
  monto: number;
  moneda: string;
  estatusNombre: string;
  cancelado: boolean;
};
