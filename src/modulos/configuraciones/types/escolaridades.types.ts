// src/modules/configuraciones/catalogos/escolaridades/types/escolaridad.types.ts
export type Escolaridad = {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
};

export type EscolaridadCreate = {
  codigo: string;
  nombre: string;
  // NO lo mandes si el back default = true
  // activo?: boolean;
};

export type EscolaridadUpdate = {
  nombre: string;
};
