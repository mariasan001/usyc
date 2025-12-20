// src/shared/utils/money-to-words.es-mx.ts
function unidades(n: number) {
  const u = [
    'CERO','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE',
    'DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE'
  ];
  return u[n] ?? '';
}

function decenas(n: number) {
  if (n < 16) return unidades(n);
  if (n < 20) return `DIECI${unidades(n - 10)}`;
  if (n === 20) return 'VEINTE';
  if (n < 30) return `VEINTI${unidades(n - 20)}`;

  const d = Math.floor(n / 10);
  const r = n % 10;
  const names: Record<number, string> = {
    3: 'TREINTA',
    4: 'CUARENTA',
    5: 'CINCUENTA',
    6: 'SESENTA',
    7: 'SETENTA',
    8: 'OCHENTA',
    9: 'NOVENTA',
  };
  return r ? `${names[d]} Y ${unidades(r)}` : names[d];
}

function centenas(n: number) {
  if (n < 100) return decenas(n);
  if (n === 100) return 'CIEN';

  const c = Math.floor(n / 100);
  const r = n % 100;

  const names: Record<number, string> = {
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

  return r ? `${names[c]} ${decenas(r)}` : names[c];
}

function miles(n: number) {
  if (n < 1000) return centenas(n);
  const m = Math.floor(n / 1000);
  const r = n % 1000;

  const left = m === 1 ? 'MIL' : `${centenas(m)} MIL`;
  const right = r ? ` ${centenas(r)}` : '';
  return `${left}${right}`;
}

export function mxnToWords(amount: number) {
  const safe = Number.isFinite(amount) ? amount : 0;

  const entero = Math.floor(safe);
  const centavos = Math.round((safe - entero) * 100);

  const centStr = String(centavos).padStart(2, '0');

  const letrasEntero = miles(entero) || 'CERO';
  const pesoWord = entero === 1 ? 'PESO' : 'PESOS';

  return `${letrasEntero} ${pesoWord} ${centStr}/100 M.N.`;
}
