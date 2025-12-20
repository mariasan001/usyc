'use client';

import { useMemo } from 'react';
import Image from 'next/image';

import type { Receipt } from '@/modules/receipts/types/receipt.types';
import type { ReceiptTemplateSettings } from '@/modules/receipts/utils/receipt-template.settings';

import s from './ReceiptDocument.module.css';

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
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

function QrImgApi({ src }: { src: string }) {
  // ✅ Con <img> evitamos configuración extra de next/image para dominios.
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

  // ✅ nuevo: lo necesitamos para el endpoint del QR
  reciboId: number;
}) {
  const folioDisplay = useMemo(() => splitFolio(receipt.folio), [receipt.folio]);

  const qrSrc = useMemo(() => {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recibos/${reciboId}/qr`;
  }, [reciboId]);

  const cancelled = receipt.status === 'CANCELLED';
  const concepto = safeText(receipt.concepto, 'Colegiatura');
  const fecha = safeDate(receipt.fechaPago);

  return (
    <div className={s.page}>
      <div className={s.sheet}>
        {cancelled ? <div className={s.watermark}>CANCELADO</div> : null}

        <div className={s.top}>
          <div className={s.logoBox}>
            {settings.logoDataUrl ? (
              <Image alt="Logo" src={settings.logoDataUrl} width={120} height={120} className={s.logo} />
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

        <div className={s.infoBox}>
          <div className={s.row2}>
            <div className={s.field}>
              <div className={s.fieldLabel}>NOMBRE :</div>
              <div className={s.fieldLine}>{safeText(receipt.alumno?.nombre)}</div>
            </div>

            <div className={s.fieldRight}>
              <div className={s.fieldRightLabel}>LA CANTIDAD DE:</div>
              <div className={s.fieldRightValue}>{fmtMoney(receipt.monto)}</div>
            </div>
          </div>

          <div className={s.row1}>
            <div className={s.field}>
              <div className={s.fieldLabel}>CANTIDAD EN LETRAS :</div>
              <div className={s.fieldLine}>{safeText(receipt.montoLetras)}</div>
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
