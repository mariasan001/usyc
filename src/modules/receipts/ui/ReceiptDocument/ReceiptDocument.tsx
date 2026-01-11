'use client';

import { useMemo } from 'react';

import type { ReceiptTemplateSettings } from '@/modules/receipts/utils/receipt-template.settings';
import { RecibosService } from '@/modulos/alumnos/services/recibos.service';

import s from './ReceiptDocument.module.css';

export type ReceiptPrint = {
  folio: string;
  fechaPago: string; // YYYY-MM-DD

  concepto: string;
  monto: number;
  moneda?: string; // "MXN"

  status: 'VALID' | 'CANCELLED';
  cancelReason?: string;

  alumnoNombre?: string;
  matricula?: string;
  carreraNombre?: string;

  qrPayload?: string;
};

/* ─────────────────────────────────────────
  Helpers
───────────────────────────────────────── */
function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number.isFinite(n) ? n : 0);
}

function safeDate(v?: string) {
  return v?.trim() ? v : '—';
}

function safeText(v?: string | null, fallback = '—') {
  const t = (v ?? '').toString().trim();
  return t ? t : fallback;
}

function folioFull(folio?: string) {
  return safeText(folio, '—');
}

function toMoneyWordsMXN(amount: number) {
  const n = Number.isFinite(amount) ? amount : 0;

  const entero = Math.floor(Math.abs(n));
  const dec = Math.round((Math.abs(n) - entero) * 100);
  const dec2 = String(dec).padStart(2, '0');

  const letrasEntero = numberToSpanishWords(entero).toUpperCase();
  const pesoWord = entero === 1 ? 'PESO' : 'PESOS';

  return `${letrasEntero} ${pesoWord} ${dec2}/100 M.N.`;
}

function numberToSpanishWords(num: number): string {
  if (num === 0) return 'cero';

  const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
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
    if (n > 20 && n < 30) return `veinti${unidades[n - 20]}`;
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

  if (num < 1000) return threeDigits(num);

  if (num < 1_000_000) {
    const miles = Math.floor(num / 1000);
    const rest = num % 1000;
    const milesText = miles === 1 ? 'mil' : `${threeDigits(miles)} mil`;
    const restText = rest ? ` ${threeDigits(rest)}` : '';
    return `${milesText}${restText}`.trim();
  }

  return String(num);
}

function QrImgApi({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="QR del recibo" className={s.qrImg} />;
}

export default function ReceiptDocument({
  receipt,
  settings,
  reciboId,
}: {
  receipt: ReceiptPrint;
  settings: ReceiptTemplateSettings;
  reciboId: number;
}) {
  const folioDisplay = useMemo(() => folioFull(receipt.folio), [receipt.folio]);
  const qrSrc = useMemo(() => RecibosService.qrUrl(reciboId), [reciboId]);

  const cancelled = receipt.status === 'CANCELLED';

  const concepto = safeText(receipt.concepto, 'Colegiatura');
  const fecha = safeDate(receipt.fechaPago);

  const nombre = safeText(receipt.alumnoNombre, '—');
  const carreraNombre = safeText(receipt.carreraNombre, '—');
  const qrPayload = safeText(receipt.qrPayload, '');

  const montoLetras = useMemo(
    () => toMoneyWordsMXN(receipt.monto ?? 0),
    [receipt.monto],
  );

  const moneda = safeText(receipt.moneda, 'MXN');

  return (
    <div className={s.page}>
      <div className={s.sheet}>
        {cancelled ? <div className={s.watermark}>CANCELADO</div> : null}

        <header className={s.header}>
          <div className={s.headerLeft}>
            <div className={s.logoWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/usyc-logo.png" alt="Logo" className={s.logo} />
            </div>

            <div className={s.folioMini}>
              <span className={s.folioPrefix}>FOLIO:</span>
              <span className={s.folioNumMini}>{folioDisplay}</span>
            </div>
          </div>

          <div className={s.headerCenter}>
            <div className={s.headerTitle}>RECIBO DE CAJA</div>
            <div className={s.headerSub}>
              {safeText(settings.plantelName, 'PLANTEL')}
            </div>
          </div>

          <div className={s.headerRight}>
            <div className={s.headerRightTitle}>CONTROL ESCOLAR</div>
            <div className={s.headerRightRow}>
              <span className={s.headerRightLabel}>FECHA:</span>
              <span className={s.headerRightValue}>{fecha}</span>
            </div>
          </div>
        </header>

        <div className={s.divider} />

        <main className={s.body}>
          <section className={s.form}>
            <div className={s.fieldRow}>
              <div className={s.label}>NOMBRE&nbsp;&nbsp;COMPLETO:</div>
              <div className={s.lineValue}>{nombre}</div>
            </div>

            <div className={s.fieldRow}>
              <div className={s.label}>CARRERA:</div>
              <div className={s.lineValue}>{carreraNombre}</div>
            </div>

            <div className={s.fieldRow}>
              <div className={s.label}>CANTIDAD EN LETRAS:</div>
              <div className={s.lineValue}>{montoLetras}</div>
            </div>

            <div className={s.fieldRow}>
              <div className={s.label}>CONCEPTO:</div>
              <div className={s.lineValue}>{concepto}</div>
            </div>

            <div className={s.totalRow}>
              <div className={s.label}>TOTAL:</div>
              <div className={s.totalPill}>
                {fmtMoney(receipt.monto)}{' '}
                <span className={s.currency}>{moneda}</span>
              </div>
            </div>

            <div className={s.sigs}>
              <div className={s.sig}>
                <div className={s.sigLine} />
                <div className={s.sigLabel}>RECIBÍ CONFORME</div>
              </div>

              <div className={s.sig}>
                <div className={s.sigLine} />
                <div className={s.sigLabel}>ENTREGUÉ CONFORME</div>
              </div>
            </div>

            {cancelled ? (
              <div className={s.cancelBox}>
                <div className={s.cancelTitle}>Motivo de cancelación</div>
                <div className={s.cancelReason}>
                  {safeText(receipt.cancelReason)}
                </div>
              </div>
            ) : null}
          </section>

          <aside className={s.qrSide}>
            <div className={s.qrFrame}>
              <QrImgApi src={qrSrc} />
            </div>

            {qrPayload ? (
              <div className={s.payloadBox}>
                <div className={s.payloadTitle}>QR PAYLOAD</div>
                <div className={s.payloadText}>{qrPayload}</div>
              </div>
            ) : null}
          </aside>
        </main>
      </div>
    </div>
  );
}
