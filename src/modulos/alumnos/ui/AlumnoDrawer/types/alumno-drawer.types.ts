// src/modulos/alumnos/ui/AlumnoDrawer/types/alumno-drawer.types.ts
import type { ReciboConcepto } from './recibos.types';

export type DrawerTab = 'RESUMEN' | 'PROYECCION' | 'PAGOS' | 'EXTRAS';

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

export type ProjectionRow = {
  idx: number;
  periodo: string;        // "2025-12"
  dueDate: string;        // "2025-12-01"
  conceptCode: ReciboConcepto; // ✅ antes string -> ahora el union real del backend
  amount: number;
  estado: string;         // texto que venga del back
  isPaid: boolean;
  reciboId?: number;
};

export type PagoRealRow = {
  reciboId: number;
  folio: string;

  fechaEmision: string;   // viene del back
  fechaPago: string;      // ISO

  alumnoId: string;       // viene del back
  alumnoNombre?: string;

  concepto: ReciboConcepto; // ✅ si el back manda string libre, aquí puedes dejar string,
                            // pero lo ideal es alinear con ReciboConcepto
  monto: number;
  moneda: string;

  estatusCodigo: string;
  estatusNombre: string;

  tipoPagoId: number;
  tipoPagoCodigo: string;
  tipoPagoNombre: string;

  cancelado: boolean;

  // ✅ normalizado (tu mapper debe llenar qrPayload)
  qrPayload: string;

  // ✅ por inconsistencia del back: que sea opcional (no obligues a tenerlo siempre)
  qrPayLoad?: string;
};

export type Totals = {
  totalPlan: number;
  totalPagado: number;
  saldo: number;

  pagados: number;
  pendientes: number;
  vencidos: number;

  totalExtras?: number;
};
