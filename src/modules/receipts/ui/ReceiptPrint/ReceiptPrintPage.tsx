'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Printer, ArrowLeft, AlertTriangle } from 'lucide-react';

import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';

import { createReceiptService } from '@/modules/receipts/services/receipt.service';
import type { Receipt } from '@/modules/receipts/types/receipt.types';
import ReceiptDocument from '@/modules/receipts/ui/ReceiptDocument/ReceiptDocument';

import { loadReceiptSettings } from '@/modules/receipts/utils/receipt-template.settings';
import s from './ReceiptPrintPage.module.css';

function parseFolios(sp: URLSearchParams) {
  const one = sp.get('folio');
  const many = sp.get('folios');

  if (one) return [one];
  if (many) return many.split(',').map((x) => x.trim()).filter(Boolean);
  return [];
}

export default function ReceiptPrintPage() {
  const sp = useSearchParams();
  const api = useMemo(() => createReceiptService(), []);

  const [items, setItems] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState<string[]>([]);
  const didAutoPrint = useRef(false);

  const settings = useMemo(() => loadReceiptSettings(), []);

  const folios = useMemo(() => parseFolios(sp), [sp]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const found: Receipt[] = [];
        const notFound: string[] = [];

        for (const f of folios) {
          const r = await api.getByFolio(f);
          if (r) found.push(r);
          else notFound.push(f);
        }

        // orden estable por folio
        found.sort((a, b) => a.folio.localeCompare(b.folio));

        if (!alive) return;

        setItems(found);
        setMissing(notFound);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [api, folios]);

  // Auto print una vez (si hay algo)
  useEffect(() => {
    if (loading) return;
    if (items.length === 0) return;
    if (didAutoPrint.current) return;

    didAutoPrint.current = true;

    // mini delay para que renderice
    const t = setTimeout(() => {
      window.print();
    }, 450);

    return () => clearTimeout(t);
  }, [loading, items.length]);

  return (
    <div className={s.wrap}>
      {/* Controls (no se imprimen) */}
      <div className={s.controls}>
        <Link className={s.back} href="/recibos">
          <ArrowLeft size={16} /> Volver a recibos
        </Link>

        <div className={s.right}>
          <Badge tone="info">
            {folios.length || 0} seleccionados
          </Badge>

          <Button
            onClick={() => window.print()}
            leftIcon={<Printer size={16} />}
            disabled={loading || items.length === 0}
          >
            Imprimir
          </Button>
        </div>
      </div>

      {missing.length ? (
        <Card
          title="Algunos folios no se encontraron"
          subtitle="No se imprimirán porque no existen en el sistema."
          right={<Badge tone="warn"><AlertTriangle size={14} /> Aviso</Badge>}
        >
          <div className={s.missing}>{missing.join(', ')}</div>
        </Card>
      ) : null}

      {loading ? <div className={s.loading}>Cargando recibos…</div> : null}

      {!loading && items.length === 0 ? (
        <div className={s.loading}>No hay recibos para imprimir.</div>
      ) : null}

      {/* Pages */}
      <div className={s.pages}>
        {items.map((r) => (
          <div key={r.folio} className={s.printPage}>
            <ReceiptDocument receipt={r} settings={settings} />
          </div>
        ))}
      </div>
    </div>
  );
}
