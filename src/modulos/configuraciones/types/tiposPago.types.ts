export type TipoPago = {
  id: number;
  code: string;
  name: string;
  active: boolean;
};

export type TipoPagoCreate = {
  code: string;
  name: string;
  active: boolean;
};

export type TipoPagoUpdate = {
  name: string;
  active: boolean;
};
