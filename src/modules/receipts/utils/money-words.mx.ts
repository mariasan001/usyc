function twoDigits(n: number) {
  const v = Math.floor(Math.abs(n));
  return String(v).padStart(2, '0');
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const UNITS = [
  '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
];

const TEENS: Record<number, string> = {
  10: 'DIEZ',
  11: 'ONCE',
  12: 'DOCE',
  13: 'TRECE',
  14: 'CATORCE',
  15: 'QUINCE',
  16: 'DIECISÉIS',
  17: 'DIECISIETE',
  18: 'DIECIOCHO',
  19: 'DIECINUEVE',
};

const TENS: Record<number, string> = {
  20: 'VEINTE',
  30: 'TREINTA',
  40: 'CUARENTA',
  50: 'CINCUENTA',
  60: 'SESENTA',
  70: 'SETENTA',
  80: 'OCHENTA',
  90: 'NOVENTA',
};

const HUNDREDS: Record<number, string> = {
  1: 'CIENTO',
  2: 'DOSCIENTOS',
  3: 'TRESCIENTOS',
  4: 'CUATROCIENTOS',
  5: 'QUINIENTOS',
  6: 'SEISCIENTOS',
  7: 'SETECIENTOS',
  8: 'OCHOCIENTOS',
  9: 'NOVECIENTOS',
};

function convertUnder100(n: number): string {
  if (n < 10) return UNITS[n];
  if (n >= 10 && n <= 19) return TEENS[n];

  if (n >= 20 && n <= 29) {
    if (n === 20) return 'VEINTE';
    return `VEINTI${UNITS[n - 20].toLowerCase()}`.toUpperCase(); // VEINTIUNO...
  }

  const ten = Math.floor(n / 10) * 10;
  const unit = n % 10;
  if (unit === 0) return TENS[ten];
  return `${TENS[ten]} Y ${UNITS[unit]}`;
}

function convertUnder1000(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'CIEN';
  if (n < 100) return convertUnder100(n);

  const h = Math.floor(n / 100);
  const rest = n % 100;

  const head = HUNDREDS[h];
  const tail = rest ? convertUnder100(rest) : '';
  return tail ? `${head} ${tail}` : head;
}

function normalizeUno(text: string): string {
  // "UNO MIL" -> "UN MIL" (aunque no suele salir así)
  return text.replace(/\bUNO\b/g, 'UN');
}

function convertNumberToWords(n: number): string {
  n = Math.floor(n);

  if (n === 0) return 'CERO';

  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const hundreds = n % 1000;

  const parts: string[] = [];

  if (millions) {
    if (millions === 1) parts.push('UN MILLÓN');
    else parts.push(`${normalizeUno(convertUnder1000(millions))} MILLONES`);
  }

  if (thousands) {
    if (thousands === 1) parts.push('MIL');
    else parts.push(`${normalizeUno(convertUnder1000(thousands))} MIL`);
  }

  if (hundreds) parts.push(convertUnder1000(hundreds));

  return normalizeUno(parts.join(' ').trim());
}

/**
 * Convierte 1234.56 -> "MIL DOSCIENTOS TREINTA Y CUATRO PESOS 56/100 M.N."
 */
export function moneyToWordsMXN(amount: number): string {
  const v = round2(amount);
  const abs = Math.abs(v);

  const entero = Math.floor(abs);
  const centavos = Math.round((abs - entero) * 100);

  const words = convertNumberToWords(entero);
  const cent = twoDigits(centavos);

  const moneda = entero === 1 ? 'PESO' : 'PESOS';
  return `${words} ${moneda} ${cent}/100 M.N.`;
}
