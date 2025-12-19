// src/modulos/alumnos/types/alumnos.tipos.ts

export type ID = string;

export type Plantel = {
  id: ID;
  nombre: string;
};

export type EscolaridadNivel =
  | 'PRIMARIA'
  | 'SECUNDARIA'
  | 'BACHILLERATO'
  | 'LICENCIATURA'
  | 'POSGRADO';

export type Escolaridad = {
  id: ID;
  nombre: string;
  nivel: EscolaridadNivel;
  requiereCarrera: boolean;
};

export type Carrera = {
  id: ID;
  nombre: string;
  escolaridadId: ID; // FK a Escolaridad
  duracionMeses: number;
  precioMensual: number;
};

export type AlumnoEstado = 'ACTIVO' | 'POR_VENCER' | 'EGRESADO';

export type Alumno = {
  id: ID;

  nombre: string;
  matricula: string;

  escolaridadId: ID;
  carreraId?: ID | null;

  plantelId: ID;

  fechaIngreso: string; // ISO (YYYY-MM-DD)
  fechaTermino: string; // ISO (YYYY-MM-DD)

  duracionMeses: number;
  precioMensual: number;

  estado: AlumnoEstado;

  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type AlumnoCreatePayload = {
  nombre: string;
  matricula: string;

  escolaridadId: ID;
  carreraId?: ID | null;

  plantelId: ID;

  fechaIngreso: string; // ISO (YYYY-MM-DD)

  // opcional: si quieres permitir override manual (por ahora no lo usamos)
  duracionMeses?: number;
  precioMensual?: number;

  // futuro: pago inicial
  pagoInicialAplica?: boolean;
  pagoInicialMonto?: number;
};
