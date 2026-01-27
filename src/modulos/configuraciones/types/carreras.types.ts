// src/modules/configuraciones/catalogos/carreras/types/carreras.types.ts

/** ✅ Lo que ENVIAMOS al backend (POST/PUT) */
export type CarreraConceptoIn = {
  conceptoId: number;
  monto: number;
  cantidad: number;
  activo: boolean;
};

/** ✅ Lo que RECIBIMOS del backend (GET) */
export type CarreraConceptoOut = CarreraConceptoIn & {
  conceptoCodigo?: string;
  conceptoNombre?: string;
};

/** ✅ Modelo que usa tu app al listar / ver detalle */
export type Carrera = {
  carreraId: string;
  escolaridadId: number;
  escolaridadNombre?: string;

  nombre: string;

  duracionAnios: number;
  duracionMeses: number;

  activo: boolean;

  // ✅ viene en GET /carreras (según Swagger)
  totalProyectado?: number;

  // ✅ en respuesta trae codigo/nombre por concepto
  conceptos: CarreraConceptoOut[];
};

/** ✅ Payload de crear carrera (POST) */
export type CarreraCreate = {
  carreraId: string;
  escolaridadId: number;
  nombre: string;

  duracionAnios: number;
  duracionMeses: number;

  activo: boolean;

  // ✅ input “limpio”
  conceptos: CarreraConceptoIn[];
};

/** ✅ Payload de actualizar carrera (PUT) */
export type CarreraUpdate = {
  escolaridadId: number;
  nombre: string;

  duracionAnios: number;
  duracionMeses: number;

  activo: boolean;

  // ✅ input “limpio”
  conceptos: CarreraConceptoIn[];
};
