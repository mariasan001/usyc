// src/modules/configuraciones/catalogos/types/estatusRecibo.types.ts
export type EstatusRecibo = {
  id: number;
  codigo: string;
  nombre: string;
  activo?: boolean; // ✅ opcional por si el back lo manda en list/get
};

export type EstatusReciboCreate = {
  codigo: string;
  nombre: string;
};

export type EstatusReciboUpdate = {
  nombre: string;
};
