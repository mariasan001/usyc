'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Printer, AlertTriangle } from 'lucide-react';

import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';

import ReceiptDocument from '@/modules/receipts/ui/ReceiptDocument/ReceiptDocument';
import { loadReceiptSettings } from '@/modules/receipts/utils/receipt-template.settings';

import s from './ReceiptPrintPage.module.css';
import { useReceiptPrint } from '@/modulos/alumnos/hooks/useReceiptPrint';

function parseReciboId(sp: URLSearchParams): number | null {
  const v = sp.get('reciboId');
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseAlumnoId(sp: URLSearchParams): string | null {
  const v = sp.get('alumnoId');
  const t = (v ?? '').trim();
  return t ? t : null;
}

export default function ReceiptPrintPage() {
  const sp = useSearchParams();
  const settings = useMemo(() => loadReceiptSettings(), []);

  const reciboId = useMemo(() => parseReciboId(sp), [sp]);
  const alumnoId = useMemo(() => parseAlumnoId(sp), [sp]);

  const { loading, error, receipt, qrSrc } = useReceiptPrint({ reciboId, alumnoId }); // ✅ qrSrc

  const didAutoPrint = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!receipt) return;
    if (didAutoPrint.current) return;

    didAutoPrint.current = true;
    const t = window.setTimeout(() => window.print(), 650);
    return () => clearTimeout(t);
  }, [loading, receipt]);

  return (
    <div className={s.wrap}>
      <div className={s.controls}>
        <Link className={s.back} href="/alumnos">
          <ArrowLeft size={16} /> Volver
        </Link>

        <div className={s.right}>
          <Badge tone="info">{reciboId ? `Recibo #${reciboId}` : '—'}</Badge>

          <Button
            onClick={() => window.print()}
            leftIcon={<Printer size={16} />}
            disabled={!receipt}
          >
            Imprimir
          </Button>
        </div>
      </div>

      {error ? (
        <Card
          title="No se pudo cargar el comprobante"
          subtitle="Se intentó sessionStorage y luego se reconstruyó desde pagos-resumen."
          right={
            <Badge tone="warn">
              <AlertTriangle size={14} /> Aviso
            </Badge>
          }
        >
          <div className={s.missing}>{error}</div>
        </Card>
      ) : null}

      {loading ? <div className={s.loading}>Cargando recibo…</div> : null}
      {!loading && !receipt ? <div className={s.loading}>No hay recibo para imprimir.</div> : null}

      <div className={s.pages}>
        {receipt && reciboId ? (
          <div className={s.printPage}>
            <ReceiptDocument
              receipt={receipt}
              settings={settings}
              reciboId={reciboId}
              qrSrc={qrSrc} // ✅ se lo pasamos al doc
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}