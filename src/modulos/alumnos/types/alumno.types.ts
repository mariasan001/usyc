// src/modulos/alumnos/types/alumno.types.ts

export type Alumno = {
  alumnoId: string;

  nombreCompleto: string;
  matricula: string;

  escolaridadId: number;
  escolaridadNombre: string;

  carreraId?: string | null;
  carreraNombre?: string | null;

  fechaIngreso: string;            // YYYY-MM-DD
  fechaTermino?: string | null;    // puede venir null
  activo: boolean;
};

export type AlumnoCreate = {
  nombreCompleto: string;
  matricula: string;
  escolaridadId: number;
  carreraId?: string;              // ✅ opcional
  fechaIngreso: string;
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
