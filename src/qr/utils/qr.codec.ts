export const QR_TAG = 'USYC';

export function encodeReceiptQr(folio: string) {
  const f = (folio ?? '').trim();
  // Formato: USYC|<folio>
  return `${QR_TAG}|${f}`;
}

/**
 * Devuelve folio si el QR corresponde al sistema.
 * Acepta espacios alrededor del separador.
 */
export function decodeReceiptQr(raw: string): { folio: string } | null {
  const t = (raw ?? '').trim();
  if (!t) return null;

  const parts = t.split('|').map((x) => x.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const [tag, folio] = parts;

  if (tag !== QR_TAG) return null;
  if (!folio || folio.length < 3) return null; // mínimo razonable

  return { folio };
}
