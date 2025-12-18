export type ReceiptStatus = 'VALID' | 'CANCELLED';

// ✅ nuevo: duración del plan
export type StudentPlanDuration = 6 | 12 | 24 | 36 | 48;

export type ReceiptAlumno = {
  matricula?: string; // opcional
  nombre: string;

  // ✅ nuevo (plan del alumno)
  carrera?: string;
  duracionMeses?: StudentPlanDuration;

  // ✅ opcional: si luego quieres “fecha ingreso” fija por alumno
  fechaInicio?: string; // "YYYY-MM-DD"
};

export type Receipt = {
  folio: string;

  alumno: ReceiptAlumno;
  concepto: string;

  monto: number;
  montoLetras: string;

  fechaPago: string; // "YYYY-MM-DD"
  status: ReceiptStatus;

  cancelReason?: string;
  cancelledAt?: string;

  createdAt: string;
  updatedAt: string;
};

export type ReceiptCreateInput = {
  alumnoNombre: string;
  alumnoMatricula?: string;

  // ✅ nuevo (lo que ya mandas desde el form)
  alumnoCarrera: string;
  alumnoDuracionMeses: StudentPlanDuration;

  concepto: string;
  monto: number;
  fechaPago: string;
};

export type ReceiptQuery = {
  q?: string;
  status?: ReceiptStatus | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  folio?: string;
};
