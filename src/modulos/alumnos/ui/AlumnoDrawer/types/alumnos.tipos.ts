export type PagoMetodo = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

export type PagoEstatus = 'PENDIENTE' | 'PAGADO' | 'VENCIDO';

export type PagoTipo = 'MENSUALIDAD' | 'EXTRA';

export type PagoConcepto =
  | 'Mensualidad'
  | 'Inscripción'
  | 'Curso'
  | 'Conferencia'
  | 'Certificación'
  | 'Otro';

export type ProyeccionItem = {
  id: ID;
  tipo: PagoTipo;                // MENSUALIDAD | EXTRA
  concepto: PagoConcepto | string;
  periodo?: string;              // ej: "2026-03" para mensualidades
  fechaProgramada: string;       // YYYY-MM-DD
  monto: number;
};

export type PagoItem = {
  id: ID;
  refProyeccionId?: ID;          // liga al item proyectado (si aplica)
  tipo: PagoTipo;
  concepto: PagoConcepto | string;
  periodo?: string;

  monto: number;
  metodo: PagoMetodo;
  fechaPago: string;             // YYYY-MM-DD
  creadoEn: string;              // ISO
};

export type FinancieroResumen = {
  totalPlan: number;             // mensualidades + extras
  totalPagado: number;
  saldo: number;
  vencidos: number;
  pendientes: number;
  pagados: number;

  proximoPendiente?: ProyeccionItem;
};
