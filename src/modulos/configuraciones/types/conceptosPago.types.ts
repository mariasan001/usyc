export type ConceptoPago = {
  conceptoId: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipoMonto: string; // luego lo refinamos a union si nos das el catálogo real
  activo: boolean;
};

export type ConceptoPagoCreate = {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipoMonto: string;
  activo: boolean;
};

export type ConceptoPagoUpdate = {
  nombre: string;
  descripcion: string;
  tipoMonto: string;
  activo: boolean;
};
