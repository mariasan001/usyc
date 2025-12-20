// src/modulos/alumnos/ui/AlumnoDrawer/types/alumno-drawer.types.ts

export type DrawerTab = 'RESUMEN' | 'PROYECCION' | 'PAGOS' | 'EXTRAS';

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
export type PaymentType = 'MENSUALIDAD' | 'EXTRA';
export type PaymentStatus = 'PAGADO' | 'PENDIENTE';

export type PaymentItem = {
  id: string;
  alumnoId: string;
  type: PaymentType;
  concept: string;
  amount: number;
  date: string; // YYYY-MM-DD
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string; // ISO
};

export type ProjectionItem = {
  idx: number; // 1..N
  dueDate: string; // YYYY-MM-DD
  concept: string;
  amount: number;
  status: PaymentStatus;
  method?: PaymentMethod;
  paidAt?: string; // YYYY-MM-DD
  paymentId?: string;
};

export type Totals = {
  totalPlan: number;
  totalExtras: number;
  totalPagado: number;
  saldo: number;

  pagados: number;
  pendientes: number;
  vencidos: number;

  nextDue: ProjectionItem | null;
};

/**
 * Datos financieros / académicos “extendidos”.
 * OJO: el back todavía NO los manda en GET /alumnos/{id}, así que quedan opcionales.
 * Cuando el back los agregue, solo se llenan y listo.
 */
export type AlumnoPlanSnapshot = {
  precioMensual?: number | null;
  duracionMeses?: number | null;

  plantelNombre?: string | null;
  plantelId?: string | number | null;
};
