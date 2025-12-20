export type Plantel = {
  id: number;
  code: string;
  name: string;
  address: string;
  active: boolean;
};

export type PlantelCreate = {
  code: string;
  name: string;
  address: string;
  active: boolean;
};

export type PlantelUpdate = {
  name: string;
  address: string;
  active: boolean;
};
