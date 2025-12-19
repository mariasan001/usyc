// src/features/receipts/ui/modals/PrintReceiptsModal/PrintReceiptsModal.tsx
'use client';

import { useMemo } from 'react';
import { Printer } from 'lucide-react';

import Modal from '@/shared/ui/Modal/Modal';
import Button from '@/shared/ui/Button/Button';

import s from './PrintReceiptsModal.module.css';
import { Payment } from '../../types/payment.types';

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function PrintReceiptsModal({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: Payment[];
}) {
  const canPrint = useMemo(() => items.length > 0, [items.length]);

  function printNow() {
    // ✅ imprime el contenido del modal con CSS @media print
    window.print();
  }

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className={s.shell}>
        <div className={s.top}>
          <div>
            <div className={s.title}>Comprobante{items.length > 1 ? 's' : ''} de pago</div>
            <div className={s.sub}>
              {items.length === 1 ? 'Vista previa' : `Lote • ${items.length} comprobantes`}
            </div>
          </div>

          <div className={s.actions}>
            <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            <Button onClick={printNow} disabled={!canPrint} leftIcon={<Printer size={16} />}>
              Imprimir
            </Button>
          </div>
        </div>

        <div className={s.preview}>
          {items.map((p) => (
            <div key={p.id} className={s.paper}>
              <div className={s.paperHeader}>
                <div className={s.brand}>Recibo</div>
                <div className={s.folio}>Folio: <b>{p.folio}</b></div>
              </div>

              <div className={s.row}>
                <div className={s.label}>Alumno</div>
                <div className={s.value}>{p.alumnoNombre}</div>
              </div>
              <div className={s.row2}>
                <div className={s.cell}>
                  <div className={s.label}>Matrícula</div>
                  <div className={s.value}>{p.alumnoMatricula ?? '—'}</div>
                </div>
                <div className={s.cell}>
                  <div className={s.label}>Carrera</div>
                  <div className={s.value}>{p.carrera}</div>
                </div>
              </div>

              <div className={s.row2}>
                <div className={s.cell}>
                  <div className={s.label}>Fecha</div>
                  <div className={s.value}>{p.fecha}</div>
                </div>
                <div className={s.cell}>
                  <div className={s.label}>Concepto</div>
                  <div className={s.value}>{p.concepto}</div>
                </div>
              </div>

              <div className={s.total}>
                <div className={s.totalLabel}>Total</div>
                <div className={s.totalValue}>{fmtMoney(p.valor)}</div>
              </div>

              <div className={s.footerNote}>
                Estatus: <b>{p.estatus}</b>
                {p.estatus === 'CANCELADO' ? ` • Motivo: ${p.motivoCancelacion ?? '—'}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
