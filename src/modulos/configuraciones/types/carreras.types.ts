// src/modules/configuraciones/catalogos/carreras/types/carrera.types.ts
export type Carrera = {
  carreraId: string; // "01", "10"
  escolaridadId: number;
  escolaridadNombre?: string;
  nombre: string;

  montoMensual: number;
  montoInscripcion: number;

  duracionAnios: number;
  duracionMeses: number;

  activo: boolean;
};

export type CarreraCreate = {
  carreraId: string;
  escolaridadId: number;
  nombre: string;
  montoMensual: number;
  montoInscripcion: number;
  duracionAnios: number;
  duracionMeses: number;
  activo: boolean;
};

export type CarreraUpdate = {
  escolaridadId: number;
  nombre: string;
  montoMensual: number;
  montoInscripcion: number;
  duracionAnios: number;
  duracionMeses: number;
  activo: boolean;
};
