'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Printer, AlertTriangle } from 'lucide-react';

import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';

import ReceiptDocument from '@/modules/receipts/ui/ReceiptDocument/ReceiptDocument';
import { loadReceiptSettings } from '@/modules/receipts/utils/receipt-template.settings';

import type { ReciboDTO } from '@/modulos/alumnos/ui/AlumnoDrawer/types/recibos.types';

import s from './ReceiptPrintPage.module.css';

function parseReciboId(sp: URLSearchParams): number | null {
  const v = sp.get('reciboId');
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function mapReciboToReceipt(dto: ReciboDTO): Receipt {
  return {
    folio: dto.folio,
    alumno: {
      nombre: dto.alumnoNombre ?? '—',
      matricula: dto.alumnoId ?? undefined,
      carrera: '—',
      duracionMeses: undefined,
      fechaInicio: undefined,
    },
    concepto: dto.concepto,
    monto: dto.monto ?? 0,
    montoLetras: '—', // luego lo convertimos a letras si quieres
    fechaPago: dto.fechaPago,
    status: dto.cancelado ? 'CANCELLED' : 'VALID',
    cancelReason: undefined,
    createdAt: dto.fechaEmision,
    updatedAt: dto.fechaEmision,
  };
}

export default function ReceiptPrintPage() {
  const sp = useSearchParams();
  const settings = useMemo(() => loadReceiptSettings(), []);
  const reciboId = useMemo(() => parseReciboId(sp), [sp]);

  const [item, setItem] = useState<Receipt | null>(null);
  const [err, setErr] = useState<string>('');
  const didAutoPrint = useRef(false);

  useEffect(() => {
    if (!reciboId) {
      setErr('Falta reciboId en la URL.');
      return;
    }

    // ✅ leemos del storage (no hacemos GET /api/recibos/{id})
    const raw = sessionStorage.getItem(`recibo:${reciboId}`);
    if (!raw) {
      setErr('No se encontró el recibo en memoria. Vuelve a pagar o abre desde Pagos.');
      setItem(null);
      return;
    }

    try {
      const dto = JSON.parse(raw) as ReciboDTO;
      setItem(mapReciboToReceipt(dto));
      setErr('');
    } catch {
      setErr('Recibo corrupto en memoria.');
      setItem(null);
    }
  }, [reciboId]);

  useEffect(() => {
    if (!item) return;
    if (didAutoPrint.current) return;
    didAutoPrint.current = true;
    const t = setTimeout(() => window.print(), 450);
    return () => clearTimeout(t);
  }, [item]);

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
          subtitle="En este flujo el recibo se arma con la respuesta del POST."
          right={
            <Badge tone="warn">
              <AlertTriangle size={14} /> Aviso
            </Badge>
          }
        >
          <div className={s.missing}>{err}</div>
        </Card>
      ) : null}

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
