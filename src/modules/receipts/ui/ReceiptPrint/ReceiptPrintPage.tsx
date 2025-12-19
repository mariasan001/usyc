'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Printer, ArrowLeft, AlertTriangle } from 'lucide-react';

import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';

import type { Receipt } from '@/modules/receipts/types/receipt.types';
import ReceiptDocument from '@/modules/receipts/ui/ReceiptDocument/ReceiptDocument';
import { loadReceiptSettings } from '@/modules/receipts/utils/receipt-template.settings';

import s from './ReceiptPrintPage.module.css';

/** ====== misma key que usas en PaymentsIssuePage ====== */
type IssuedItem = {
  id: string; // `${studentKey}__${periodoKey}`
  studentKey: string;
  periodoKey: string; // YYYY-MM
  folio: string;
  fechaEmision: string; // YYYY-MM-DD
  concepto: string;
  monto: number;
};

const ISSUED_KEY = 'payments:issued:v1';

function loadIssued(): IssuedItem[] {
  try {
    const raw = localStorage.getItem(ISSUED_KEY);
    const parsed = raw ? (JSON.parse(raw) as IssuedItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseFolios(sp: URLSearchParams) {
  const one = sp.get('folio');
  const many = sp.get('folios');

  if (one?.trim()) return [one.trim()];
  if (many?.trim())
    return many
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

  return [];
}

/** demo súper simple */
function toReceiptDemo(it: IssuedItem): Receipt {
  const alumnoNombre = it.studentKey.includes('-') ? it.studentKey : it.studentKey; // studentKey = matricula o nombre, según tu lógica
  const isMatricula = /[A-Z]{2,}-\d+|\d{3,}/i.test(it.studentKey);

  return {
    folio: it.folio,
    alumno: {
      nombre: isMatricula ? 'ALUMNO DEMO' : alumnoNombre,
      matricula: isMatricula ? it.studentKey : undefined,
      carrera: '—',
      duracionMeses: 6,
      fechaInicio: undefined,
    },
    concepto: it.concepto ?? 'Colegiatura',
    monto: it.monto ?? 0,
    montoLetras: '—', // luego lo conectas a tu helper real
    fechaPago: it.fechaEmision, // en emisión usamos fechaEmision como fecha del doc
    status: 'VALID',
    createdAt: it.fechaEmision,
    updatedAt: it.fechaEmision,
  };
}

export default function ReceiptPrintPage() {
  const sp = useSearchParams();
  const settings = useMemo(() => loadReceiptSettings(), []);
  const folios = useMemo(() => parseFolios(sp), [sp]);

  const [items, setItems] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState<string[]>([]);
  const didAutoPrint = useRef(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const issued = loadIssued();
        const found: Receipt[] = [];
        const notFound: string[] = [];

        for (const f of folios) {
          const hit = issued.find((x) => x.folio === f);
          if (hit) found.push(toReceiptDemo(hit));
          else notFound.push(f);
        }

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
  }, [folios]);

  useEffect(() => {
    if (loading) return;
    if (items.length === 0) return;
    if (didAutoPrint.current) return;

    didAutoPrint.current = true;

    const t = setTimeout(() => {
      window.print();
    }, 450);

    return () => clearTimeout(t);
  }, [loading, items.length]);

  return (
    <div className={s.wrap}>
      <div className={s.controls}>
        <Link className={s.back} href="/pagos/emision">
          <ArrowLeft size={16} /> Volver a emisión
        </Link>

        <div className={s.right}>
          <Badge tone="info">{folios.length || 0} seleccionados</Badge>

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
          subtitle="No se imprimirán porque no existen en el storage local."
          right={
            <Badge tone="warn">
              <AlertTriangle size={14} /> Aviso
            </Badge>
          }
        >
          <div className={s.missing}>{missing.join(', ')}</div>
        </Card>
      ) : null}

      {loading ? <div className={s.loading}>Cargando recibos…</div> : null}

      {!loading && items.length === 0 ? (
        <div className={s.loading}>No hay recibos para imprimir.</div>
      ) : null}

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
