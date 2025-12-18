export type ReceiptStatus = 'VALID' | 'CANCELLED';

// duración del plan
export type StudentPlanDuration = 6 | 12 | 24 | 36 | 48;

export type ReceiptAlumno = {
  matricula?: string;
  nombre: string;

  carrera?: string;
  duracionMeses?: StudentPlanDuration;

  // ✅ ahora sí lo usamos en el registro del alumno
  fechaInicio?: string; // "YYYY-MM-DD"
};

export type Receipt = {
  folio: string;

  alumno: ReceiptAlumno;

  concepto?: string; // ✅ ahora opcional (porque ya no se captura)
  monto: number;
  montoLetras: string;

  fechaPago: string;
  status: ReceiptStatus;

  cancelReason?: string;
  cancelledAt?: string;

  createdAt: string;
  updatedAt: string;
};


// ✅ ahora es input para “registrar alumno” usando este mismo form
export type ReceiptCreateInput = {
  alumnoNombre: string;
  alumnoMatricula?: string;

  alumnoCarrera: string;
  alumnoDuracionMeses: StudentPlanDuration;

  // ✅ se quedan
  monto: number;
  fechaPago: string;

  // ❌ ya no
  // concepto: string;
};

export type ReceiptQuery = {
  q?: string;
  status?: ReceiptStatus | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  folio?: string;
};
