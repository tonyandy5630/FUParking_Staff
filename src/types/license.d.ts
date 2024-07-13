export type LicenseResponse = {
  processing_time: string;
  results: Array<Plate>;
};

type Plate = {
  plate: string;
  region: {
    code: string;
    score: string;
  };
};
