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
  activo?: boolean; // opcional por si el back default = true
};

export type EscolaridadUpdate = {
  nombre: string;
  activo: boolean;
};
