// src/modulos/alumnos/types/alumno.types.ts
export type Alumno = {
  alumnoId: string;

  nombreCompleto: string;
  matricula: string;

  escolaridadId: number;
  escolaridadNombre: string;

  carreraId: string;
  carreraNombre: string;

  fechaIngreso: string;      // "YYYY-MM-DD"
  fechaTermino?: string | null; // 👈 en listado viene null
  activo: boolean;
};

export type AlumnoCreate = {
  nombreCompleto: string;
  matricula: string;
  escolaridadId: number;
  carreraId: string;
  fechaIngreso: string; // "YYYY-MM-DD"
};

/** Page tipo Spring (como tu response del GET paginado) */
export type Page<T> = {
  content: T[];

  totalElements: number;
  totalPages: number;

  number: number; // página actual (0-based)
  size: number;

  first: boolean;
  last: boolean;
  empty: boolean;

  numberOfElements?: number;
};
