'use client';

import { useMemo } from 'react';
import Image from 'next/image';

import type { ReceiptTemplateSettings } from '@/modules/receipts/utils/receipt-template.settings';
import { RecibosService } from '@/modulos/alumnos/services/recibos.service';

import s from './ReceiptDocument.module.css';
import type { Receipt } from '@/modules/receipts/types/receipt.types';

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    Number.isFinite(n) ? n : 0,
  );
}

function pad(n: string, size = 5) {
  return (n ?? '').toString().padStart(size, '0');
}

function splitFolio(folio: string) {
  const parts = (folio ?? '').split('-');
  const raw = parts.length > 1 ? parts[parts.length - 1] : folio;
  return pad(raw.replace(/\D/g, '') || raw);
}

function safeDate(v?: string) {
  return v?.trim() ? v : '—';
}

function safeText(v?: string | null, fallback = '—') {
  const t = (v ?? '').toString().trim();
  return t ? t : fallback;
}

/**
 * Convierte número a letras en MXN (simple y suficiente para recibos).
 * 1.20 -> "UN PESO 20/100 M.N."
 * 0 -> "CERO PESOS 00/100 M.N."
 *
 * Si luego quieres “PESOS” vs “PESO” exacto, lo ajustamos (ya lo hace).
 */
function toMoneyWordsMXN(amount: number) {
  const n = Number.isFinite(amount) ? amount : 0;

  const entero = Math.floor(Math.abs(n));
  const dec = Math.round((Math.abs(n) - entero) * 100);
  const dec2 = String(dec).padStart(2, '0');

  const letrasEntero = numberToSpanishWords(entero).toUpperCase();
  const pesoWord = entero === 1 ? 'PESO' : 'PESOS';

  return `${letrasEntero} ${pesoWord} ${dec2}/100 M.N.`;
}

// Conversor básico a letras ES (0..999,999).
// Para tu sistema escolar es más que suficiente.
// Si luego manejas millones, lo extendemos.
function numberToSpanishWords(num: number): string {
  if (num === 0) return 'cero';

  const unidades = [
    '',
    'uno',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve',
  ];
  const especiales = [
    'diez',
    'once',
    'doce',
    'trece',
    'catorce',
    'quince',
    'dieciséis',
    'diecisiete',
    'dieciocho',
    'diecinueve',
  ];
  const decenas = [
    '',
    '',
    'veinte',
    'treinta',
    'cuarenta',
    'cincuenta',
    'sesenta',
    'setenta',
    'ochenta',
    'noventa',
  ];
  const centenas = [
    '',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos',
  ];

  function twoDigits(n: number) {
    if (n < 10) return unidades[n];
    if (n >= 10 && n < 20) return especiales[n - 10];
    if (n === 20) return 'veinte';
    if (n > 20 && n < 30) return `veinti${unidades[n - 20]}`; // veintiuno, veintidós...
    const d = Math.floor(n / 10);
    const u = n % 10;
    return u ? `${decenas[d]} y ${unidades[u]}` : decenas[d];
  }

  function threeDigits(n: number) {
    if (n === 100) return 'cien';
    if (n < 100) return twoDigits(n);
    const c = Math.floor(n / 100);
    const rest = n % 100;
    return rest ? `${centenas[c]} ${twoDigits(rest)}` : centenas[c];
  }

  // miles
  if (num < 1000) return threeDigits(num);

  if (num < 1000000) {
    const miles = Math.floor(num / 1000);
    const rest = num % 1000;

    const milesText = miles === 1 ? 'mil' : `${threeDigits(miles)} mil`;
    const restText = rest ? ` ${threeDigits(rest)}` : '';
    return `${milesText}${restText}`.trim();
  }

  // fallback simple (por si llega algo mayor)
  return String(num);
}

function QrImgApi({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt="QR del recibo"
      className={s.qrImg}
      style={{ width: 120, height: 120, objectFit: 'contain' }}
    />
  );
}

export default function ReceiptDocument({
  receipt,
  settings,
  reciboId,
}: {
  receipt: Receipt;
  settings: ReceiptTemplateSettings;
  reciboId: number;
}) {
  const folioDisplay = useMemo(() => splitFolio(receipt.folio), [receipt.folio]);

  // ✅ Solo el QR hace llamada (img src). Nada más.
  const qrSrc = useMemo(() => RecibosService.qrUrl(reciboId), [reciboId]);

  const cancelled = receipt.status === 'CANCELLED';
  const concepto = safeText(receipt.concepto, 'Colegiatura');
  const fecha = safeDate(receipt.fechaPago);

  // ✅ Nombre y letras desde front
  const nombre = safeText(receipt.alumno?.nombre);
  const montoLetras = useMemo(() => toMoneyWordsMXN(receipt.monto ?? 0), [receipt.monto]);

  return (
    <div className={s.page}>
      <div className={s.sheet}>
        {cancelled ? <div className={s.watermark}>CANCELADO</div> : null}

        <div className={s.top}>
          <div className={s.logoBox}>
            {/* ✅ Logo desde public/img/USYC-logo.png */}
            <Image
              alt="Logo"
              src="/img/USYC-logo.png"
              width={120}
              height={120}
              className={s.logo}
              priority
            />
          </div>

          <div className={s.topCenter}>
            <h1 className={s.title}>RECIBO DE CAJA</h1>

            <div className={s.plantelPill}>
              <span className={s.pillDot} />
              <span>{settings.plantelName}</span>
            </div>
          </div>

          <div className={s.topRight}>
            <div className={s.folioBlock}>
              <div className={s.folioLabel}>RECIBO N°</div>
              <div className={s.folioBox}>
                <div className={s.folioNum}>{folioDisplay}</div>
                <div className={s.folioSerie}>{settings.serie}</div>
              </div>
            </div>

            <div className={s.amountBlock}>
              <div className={s.amountLabel}>POR:</div>
              <div className={s.amountBox}>
                <div className={s.amountCurrency}>$</div>
                <div className={s.amountValue}>
                  {fmtMoney(receipt.monto).replace('$', '').trim()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.infoBox}>
          <div className={s.row2}>
            <div className={s.field}>
              <div className={s.fieldLabel}>NOMBRE :</div>
              <div className={s.fieldLine}>{nombre}</div>
            </div>

            <div className={s.fieldRight}>
              <div className={s.fieldRightLabel}>LA CANTIDAD DE:</div>
              <div className={s.fieldRightValue}>{fmtMoney(receipt.monto)}</div>
            </div>
          </div>

          <div className={s.row1}>
            <div className={s.field}>
              <div className={s.fieldLabel}>CANTIDAD EN LETRAS :</div>
              {/* ✅ Ya no depende de receipt.montoLetras (lo generamos) */}
              <div className={s.fieldLine}>{montoLetras}</div>
            </div>
          </div>

          <div className={s.row1}>
            <div className={s.field}>
              <div className={s.fieldLabel}>CONCEPTO :</div>
              <div className={s.fieldLine}>{concepto}</div>
            </div>
          </div>

          <div className={s.row1}>
            <div className={s.fieldDate}>
              <div className={s.fieldLabel}>FECHA:</div>
              <div className={s.dateValue}>{fecha}</div>
            </div>
          </div>

          {cancelled ? (
            <div className={s.cancelBox}>
              <div className={s.cancelTitle}>Motivo de cancelación</div>
              <div className={s.cancelReason}>{safeText(receipt.cancelReason)}</div>
            </div>
          ) : null}
        </div>

        <div className={s.bottom}>
          <div className={s.qrBlock}>
            <div className={s.qrFrame}>
              {/* ✅ QR real desde API */}
              <QrImgApi src={qrSrc} />
            </div>
            <div className={s.scanMe}>
              <span className={s.scanDot} />
              <span>SCAN ME</span>
            </div>
          </div>

          <div className={s.signatures}>
            <div className={s.sig}>
              <div className={s.sigLine} />
              <div className={s.sigLabel}>RECIBÍ CONFORME</div>
            </div>

            <div className={s.sig}>
              <div className={s.sigLine} />
              <div className={s.sigLabel}>ENTREGUÉ CONFORME</div>
            </div>
          </div>

          <div className={s.footer}>{settings.footerText}</div>
        </div>
      </div>
    </div>
  );
}
