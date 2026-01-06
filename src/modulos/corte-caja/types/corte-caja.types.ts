// src/modulos/corte-caja/types/corte-caja.types.ts
/**
 * Tipos del módulo "Corte de caja".
 *
 * Nota:
 * - Estos tipos reflejan el contrato del backend (DTO).
 * - Si luego quieres “modelos de dominio”, hacemos mappers.
 */

export type CorteCajaDTO = {
  fecha: string; // YYYY-MM-DD
  plantelId: number;

  resumen: CorteCajaResumenDTO;

  porTipoPago: CorteCajaPorTipoPagoDTO[];

  recibos: CorteCajaReciboDTO[];
};

export type CorteCajaResumenDTO = {
  totalRecibos: number;
  totalMonto: number;

  totalCancelados: number;
  totalMontoCancelado: number;
};

export type CorteCajaPorTipoPagoDTO = {
  tipoPagoId: number;
  tipoPagoDesc: string;

  totalRecibos: number;
  totalMonto: number;
};

export type CorteCajaReciboDTO = {
  reciboId: number;

  folio: string;
  folioLegacy: string;

  fechaEmision: string; // YYYY-MM-DD
  fechaPago: string; // YYYY-MM-DD

  alumnoId: string;
  alumnoNombre: string;

  concepto: string;
  monto: number;
  moneda: string;

  estatusId: number;
  estatusDesc: string;

  tipoPagoId: number;
  tipoPagoDesc: string;

  cancelado: boolean;
  plantelId: number;
};
