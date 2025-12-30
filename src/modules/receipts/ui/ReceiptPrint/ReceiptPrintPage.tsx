// src/app/recibos/print/page.tsx (o donde tengas tu print page)
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Printer, AlertTriangle } from 'lucide-react';

import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';

import ReceiptDocument, {
  type ReceiptPrint,
} from '@/modules/receipts/ui/ReceiptDocument/ReceiptDocument';

import { loadReceiptSettings } from '@/modules/receipts/utils/receipt-template.settings';

import type { ReciboDTO } from '@/modulos/alumnos/ui/AlumnoDrawer/types/recibos.types';

import s from './ReceiptPrintPage.module.css';

function parseReciboId(sp: URLSearchParams): number | null {
  const v = sp.get('reciboId');
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function readReciboFromSession(reciboId: number): ReciboDTO | null {
  try {
    const raw = sessionStorage.getItem(`recibo:${reciboId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ReciboDTO;
  } catch {
    return null;
  }
}

function mapReciboToReceipt(dto: ReciboDTO): ReceiptPrint {
  return {
    folio: dto.folio,
    fechaPago: dto.fechaPago,

    concepto: dto.concepto,
    monto: dto.monto ?? 0,
    moneda: dto.moneda ?? 'MXN',

    status: dto.cancelado ? 'CANCELLED' : 'VALID',
    cancelReason: undefined,

    alumnoNombre: dto.alumnoNombre,
    matricula: dto.matricula ?? dto.alumnoId, // si no hay matricula real, cae a alumnoId
    carreraNombre: dto.carreraNombre ?? '—',

    qrPayload: (dto.qrPayload ?? '').trim() || undefined,
  };
}

export default function ReceiptPrintPage() {
  const sp = useSearchParams();
  const settings = useMemo(() => loadReceiptSettings(), []);
  const reciboId = useMemo(() => parseReciboId(sp), [sp]);

  const [item, setItem] = useState<ReceiptPrint | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');

  const didAutoPrint = useRef(false);

  useEffect(() => {
    setLoading(true);
    setErr('');
    setItem(null);

    if (!reciboId) {
      setLoading(false);
      setErr('Falta reciboId en la URL.');
      return;
    }

    const dto = readReciboFromSession(reciboId);
    if (!dto) {
      setLoading(false);
      setErr(
        `No se encontró el recibo en sesión (recibo:${reciboId}). Vuelve al drawer y usa “Imprimir comprobante” para cachearlo.`,
      );
      return;
    }

    setItem(mapReciboToReceipt(dto));
    setLoading(false);
  }, [reciboId]);

  useEffect(() => {
    if (loading) return;
    if (!item) return;
    if (didAutoPrint.current) return;

    didAutoPrint.current = true;
    const t = setTimeout(() => window.print(), 450);
    return () => clearTimeout(t);
  }, [loading, item]);

  return (
    <div className={s.wrap}>
      <div className={s.controls}>
        <Link className={s.back} href="/alumnos">
          <ArrowLeft size={16} /> Volver
        </Link>

        <div className={s.right}>
          <Badge tone="info">{reciboId ? `Recibo #${reciboId}` : '—'}</Badge>

          <Button onClick={() => window.print()} leftIcon={<Printer size={16} />} disabled={!item}>
            Imprimir
          </Button>
        </div>
      </div>

      {err ? (
        <Card
          title="No se pudo cargar el comprobante"
          subtitle="Este print page solo usa sessionStorage (no llama GET /recibos/{id})."
          right={
            <Badge tone="warn">
              <AlertTriangle size={14} /> Aviso
            </Badge>
          }
        >
          <div className={s.missing}>{err}</div>
        </Card>
      ) : null}

      {loading ? <div className={s.loading}>Cargando recibo…</div> : null}
      {!loading && !item ? <div className={s.loading}>No hay recibo para imprimir.</div> : null}

      <div className={s.pages}>
        {item && reciboId ? (
          <div className={s.printPage}>
            <ReceiptDocument receipt={item} settings={settings} reciboId={reciboId} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
