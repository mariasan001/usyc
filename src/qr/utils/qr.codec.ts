export const QR_TAG = 'USYC';

export function encodeReceiptQr(folio: string) {
  // Formato: USYC|<folio>
  return `${QR_TAG}|${folio}`;
}

export function decodeReceiptQr(raw: string): { folio: string } | null {
  const t = (raw ?? '').trim();
  const [tag, folio] = t.split('|');
  if (tag !== QR_TAG || !folio) return null;
  return { folio };
}
