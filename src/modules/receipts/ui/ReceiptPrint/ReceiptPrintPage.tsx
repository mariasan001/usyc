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

import { RecibosService } from '@/modulos/alumnos/services/recibos.service';
import type { Receipt } from '@/modules/receipts/types/receipt.types';

import s from './ReceiptPrintPage.module.css';
import { ReciboDTO } from '@/modulos/alumnos/ui/AlumnoDrawer/types/recibos.types';

function parseReciboId(sp: URLSearchParams): number | null {
  const v = sp.get('reciboId');
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// ✅ mapea tu DTO real del back al type Receipt del documento
function mapReciboToReceipt(dto: ReciboDTO): Receipt {
  return {
    folio: dto.folio,
    alumno: {
      nombre: dto.alumnoNombre ?? '—',
      matricula: dto.alumnoId ?? undefined,
      carrera: '—', // si luego el back lo manda, aquí lo llenas
      duracionMeses: undefined,
      fechaInicio: undefined,
    },
    concepto: dto.concepto,
    monto: dto.monto ?? 0,
    montoLetras: '—', // si quieres: convertir número a letras luego
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
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');

  const didAutoPrint = useRef(false);

  useEffect(() => {
    if (!reciboId) {
      setLoading(false);
      setErr('Falta reciboId en la URL.');
      return;
    }

    const ctrl = new AbortController();

    (async () => {
      setLoading(true);
      setErr('');
      try {
        const dto = await RecibosService.getById(reciboId, { signal: ctrl.signal });
        setItem(mapReciboToReceipt(dto));
      } catch (e: any) {
        setItem(null);
        setErr(String(e?.message ?? 'No se pudo cargar el recibo.'));
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [reciboId]);

  // auto print
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
          subtitle="Revisa el reciboId y/o el endpoint."
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
        {item ? (
          <div className={s.printPage}>
            {/* ✅ le pasamos reciboId para QR */}
            <ReceiptDocument receipt={item} settings={settings} reciboId={reciboId!} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
