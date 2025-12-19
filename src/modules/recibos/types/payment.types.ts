// src/features/receipts/types/payment.types.ts
export type PaymentStatus = 'EMITIDO' | 'CANCELADO';

export type Payment = {
  id: string;         // interno (uuid o db id)
  folio: string;      // visible para el usuario
  alumnoNombre: string;
  alumnoMatricula?: string | null;
  carrera: string;
  fecha: string;      // ISO yyyy-mm-dd
  valor: number;      // monto
  concepto: string;
  estatus: PaymentStatus;
  motivoCancelacion?: string | null;
  createdAt?: string;
};
