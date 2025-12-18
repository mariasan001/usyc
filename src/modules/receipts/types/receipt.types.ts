export type ReceiptStatus = 'VALID' | 'CANCELLED';

export type ReceiptAlumno = {
  matricula?: string; // opcional por si el plantel no maneja matrícula
  nombre: string;
};

export type Receipt = {
  folio: string;

  alumno: ReceiptAlumno;
  concepto: string;

  monto: number;       // 1234.56
  montoLetras: string; // "MIL DOSCIENTOS ... 56/100 M.N."

  fechaPago: string;   // ISO: "2025-12-18"

  status: ReceiptStatus;

  cancelReason?: string;
  cancelledAt?: string; // ISO datetime

  createdAt: string;   // ISO datetime
  updatedAt: string;   // ISO datetime
};

export type ReceiptCreateInput = {
  alumnoNombre: string;
  alumnoMatricula?: string;
  concepto: string;
  monto: number;
  fechaPago: string; // "YYYY-MM-DD"
};

export type ReceiptQuery = {
  q?: string;                 // busca por folio / alumno / concepto
  status?: ReceiptStatus | 'ALL';
  dateFrom?: string;          // "YYYY-MM-DD"
  dateTo?: string;            // "YYYY-MM-DD"
  folio?: string;
};
// src/modules/receipts/types/student.types.ts
export type StudentPlanDuration = 6 | 12 | 24 | 36 | 48;

export type Student = {
  id: string;
  matricula: string;
  nombre: string;

  carrera: string;
  duracionMeses: StudentPlanDuration;

  fechaInicio: string;        // ISO yyyy-mm-dd
  mensualidad: number;        // costo mensual estándar
  createdAt: string;
};
