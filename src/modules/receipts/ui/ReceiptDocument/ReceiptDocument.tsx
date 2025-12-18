'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';

import type { Receipt } from '@/modules/receipts/types/receipt.types';
import type { ReceiptTemplateSettings } from '@/modules/receipts/utils/receipt-template.settings';

import s from './ReceiptDocument.module.css';
import { encodeReceiptQr } from '@/qr/utils/qr.codec';

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

function pad(n: string, size = 5) {
  return (n ?? '').toString().padStart(size, '0');
}

function splitFolio(folio: string) {
  // Soporta "USYC-000001" o "000001"
  const parts = folio.split('-');
  const raw = parts.length > 1 ? parts[parts.length - 1] : folio;
  return pad(raw.replace(/\D/g, '') || raw);
}

function QrImg({ value }: { value: string }) {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const dataUrl = await QRCode.toDataURL(value, {
          margin: 1,
          width: 180,
          errorCorrectionLevel: 'M',
        });
        if (alive) setSrc(dataUrl);
      } catch {
        if (alive) setSrc('');
      }
    })();

    return () => {
      alive = false;
    };
  }, [value]);

  if (!src) return <div className={s.qrFallback}>QR</div>;

  // next/image con dataURL es OK
  return <Image alt="QR" src={src} width={120} height={120} className={s.qrImg} />;
}

export default function ReceiptDocument({
  receipt,
  settings,
}: {
  receipt: Receipt;
  settings: ReceiptTemplateSettings;
}) {
  const folioDisplay = useMemo(() => splitFolio(receipt.folio), [receipt.folio]);
  const qrValue = useMemo(() => encodeReceiptQr(receipt.folio), [receipt.folio]);

  const cancelled = receipt.status === 'CANCELLED';

  return (
    <div className={s.page}>
      <div className={s.sheet}>
        {/* Watermark cancelado */}
        {cancelled ? <div className={s.watermark}>CANCELADO</div> : null}

        {/* Top bar */}
        <div className={s.top}>
          <div className={s.logoBox}>
            {settings.logoDataUrl ? (
              // Logo desde settings
              <Image
                alt="Logo"
                src={settings.logoDataUrl}
                width={120}
                height={120}
                className={s.logo}
              />
            ) : (
              <div className={s.logoPlaceholder}>LOGO</div>
            )}
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

        {/* Main info box */}
        <div className={s.infoBox}>
          <div className={s.row2}>
            <div className={s.field}>
              <div className={s.fieldLabel}>NOMBRE :</div>
              <div className={s.fieldLine}>{receipt.alumno.nombre}</div>
            </div>

            <div className={s.fieldRight}>
              <div className={s.fieldRightLabel}>LA CANTIDAD DE:</div>
              <div className={s.fieldRightValue}>{fmtMoney(receipt.monto)}</div>
            </div>
          </div>

          <div className={s.row1}>
            <div className={s.field}>
              <div className={s.fieldLabel}>CANTIDAD EN LETRAS :</div>
              <div className={s.fieldLine}>{receipt.montoLetras}</div>
            </div>
          </div>

          <div className={s.row1}>
            <div className={s.field}>
              <div className={s.fieldLabel}>CONCEPTO :</div>
              <div className={s.fieldLine}>{receipt.concepto}</div>
            </div>
          </div>

          <div className={s.row1}>
            <div className={s.fieldDate}>
              <div className={s.fieldLabel}>FECHA:</div>
              <div className={s.dateValue}>{receipt.fechaPago}</div>
            </div>
          </div>

          {cancelled ? (
            <div className={s.cancelBox}>
              <div className={s.cancelTitle}>Motivo de cancelación</div>
              <div className={s.cancelReason}>{receipt.cancelReason ?? '—'}</div>
            </div>
          ) : null}
        </div>

        {/* Bottom */}
        <div className={s.bottom}>
          <div className={s.qrBlock}>
            <div className={s.qrFrame}>
              <QrImg value={qrValue} />
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
