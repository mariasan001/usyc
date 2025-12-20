export type Alumno = {
  alumnoId: string;

  nombreCompleto: string;
  matricula: string;

  escolaridadId: number;
  escolaridadNombre: string;

  carreraId: string;
  carreraNombre: string;

  fechaIngreso: string; // "YYYY-MM-DD"
  activo: boolean;
};

export type AlumnoCreate = {
  nombreCompleto: string;
  matricula: string;
  escolaridadId: number;
  carreraId: string;
  fechaIngreso: string; // "YYYY-MM-DD"
};
