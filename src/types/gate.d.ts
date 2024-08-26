export type GateOption = {
  id: string;
  name: string;
  gateType: {
    id: string;
    name: string;
  };
};

export type GateTypeOption = {
  id: string;
  name: string;
};

export type GateType = "IN" | "OUT";

export type Gate = {
  id: string;
  name: string;
  gateType: GateType;
};
