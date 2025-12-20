export type TipoPago = {
  id: number;
  code: string;
  name: string;
  active: boolean;
};

export type TipoPagoCreate = {
  code: string;
  name: string;
  active: boolean;
};

export type TipoPagoUpdate = {
  name: string;
  active: boolean;
};

export type ReciboCreateDTO = {
  alumnoId: string;
  concepto: string;
  montoManual: number;      // ✅ ahora siempre
  fechaPago: string;        // YYYY-MM-DD
  tipoPagoId: number;       // ✅ nuevo
  comentario?: string;
};
