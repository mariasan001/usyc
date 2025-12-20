import type { PaymentMethod } from '@/modulos/alumnos/ui/AlumnoDrawer/types/alumno-drawer.types';

export type ReciboCreateRequest = {
  alumnoId: string;
  concepto: string;       // INSCRIPCION | MENSUALIDAD | OTRO | ...
  montoManual?: number;   // requerido si concepto = OTRO
  fechaPago: string;      // YYYY-MM-DD
  comentario?: string;

  // UI-only (no lo mandamos si el back aún no lo soporta)
  metodo?: PaymentMethod;
};

export type ReciboCreateResponse = {
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

  cancelado: boolean;
  qrPayload: string;
};
