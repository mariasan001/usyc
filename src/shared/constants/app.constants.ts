export const APP = {
  name: 'Control de Recibos • USYC',
  shortName: 'USYC Caja',
} as const;

export const STORAGE_KEYS = {
  receipts: 'usyc_receipts_v1',
  receiptSeq: 'usyc_receipt_seq_v1',
} as const;

export const DATA_MODE = {
  local: 'local',
  api: 'api',
} as const;

export const DATE_FMT = {
  locale: 'es-MX',
} as const;
