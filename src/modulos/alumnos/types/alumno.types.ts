// src/modulos/alumnos/types/alumno.types.ts
export type Alumno = {
  alumnoId: string;

  nombreCompleto: string;
  matricula: string;

  escolaridadId: number;
  escolaridadNombre: string;

  carreraId: string;
  carreraNombre: string;

  fechaIngreso: string;        // YYYY-MM-DD
  fechaTermino: string | null; // viene null
  activo: boolean;
};

export type AlumnoCreate = {
  nombreCompleto: string;
  matricula: string;
  escolaridadId: number;
  carreraId?: string;          // opcional si no aplica
  fechaIngreso: string;        // YYYY-MM-DD
};

export type Page<T> = {
  content: T[];

  totalElements: number;
  totalPages: number;

  number: number;              // page actual (0-based)
  size: number;

  first: boolean;
  last: boolean;
  empty: boolean;

  numberOfElements?: number;
};
