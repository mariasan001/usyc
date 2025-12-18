export type ReceiptTemplateSettings = {
  plantelName: string;     // "PLANTEL TOLUCA"
  serie: string;           // "TL"
  footerText: string;      // "Control escolar"
  logoDataUrl?: string;    // base64 (opcional)
};

export const RECEIPT_SETTINGS_KEY = 'usyc_receipt_template_settings_v1';

export const defaultReceiptSettings: ReceiptTemplateSettings = {
  plantelName: 'PLANTEL TOLUCA',
  serie: 'TL',
  footerText: 'Control escolar',
};

export function loadReceiptSettings(): ReceiptTemplateSettings {
  if (typeof window === 'undefined') return defaultReceiptSettings;
  try {
    const raw = window.localStorage.getItem(RECEIPT_SETTINGS_KEY);
    if (!raw) return defaultReceiptSettings;
    const parsed = JSON.parse(raw) as ReceiptTemplateSettings;
    return { ...defaultReceiptSettings, ...parsed };
  } catch {
    return defaultReceiptSettings;
  }
}

export function saveReceiptSettings(next: ReceiptTemplateSettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(RECEIPT_SETTINGS_KEY, JSON.stringify(next));
}
