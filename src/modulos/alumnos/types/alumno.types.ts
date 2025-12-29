export type Alumno = {
  alumnoId: string;
  nombreCompleto: string;
  matricula: string;
  escolaridadId: number;
  escolaridadNombre: string;
  carreraId?: string | null;
  carreraNombre?: string | null;
  plantelId: number;
  plantelNombre: string;
  fechaIngreso: string;            // YYYY-MM-DD
  fechaTermino?: string | null;    // puede venir null
  activo: boolean;

  // ✅ nuevo (lo manda el backend)
  recibosPreviosMigrados?: number;
};

export type AlumnoCreate = {
  nombreCompleto: string;
  matricula: string;

  escolaridadId: number;
  carreraId?: string;          // opcional (solo si aplica)

  fechaIngreso: string;
  plantelId: number;

  // ✅ nuevos (API)
  pullPrevReceipts?: boolean;
  prevReceiptsNombre?: string; // requerido si pullPrevReceipts=true
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements?: number;
};
