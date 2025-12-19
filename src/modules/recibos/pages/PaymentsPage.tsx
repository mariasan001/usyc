// src/features/receipts/pages/PaymentsPage/PaymentsPage.tsx
'use client';

import { useMemo, useState } from 'react';
import { Printer, RefreshCcw } from 'lucide-react';

import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';
import Button from '@/shared/ui/Button/Button';

import s from './PaymentsPage.module.css';
import { usePayments } from '../Hook/usePayments';
import { Payment } from '../types/payment.types';
import PaymentCaptureForm from '../ui/PaymentCaptureForm/PaymentCaptureForm';
import PaymentsHistoryTable from '../ui/PaymentsHistoryTable/PaymentsHistoryTable';
import CancelPaymentModal from '../ui/CancelPaymentModal/CancelPaymentModal';
import PrintReceiptsModal from '../modals/PrintReceiptsModal/PrintReceiptsModal';

export default function PaymentsPage() {
  const vm = usePayments();

  const [selected, setSelected] = useState<Payment[]>([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Payment | null>(null);

  const [printOpen, setPrintOpen] = useState(false);

  const total = useMemo(() => vm.raw.length, [vm.raw.length]);

  function openCancel(p: Payment) {
    setCancelTarget(p);
    setCancelOpen(true);
  }

  return (
    <div className={s.grid}>
      <Card
        title="Registrar pago"
        subtitle="Captura el pago recibido y genera el folio"
        right={<Badge tone="info">Captura</Badge>}
        className={s.left}
      >
        <div className={s.leftBody}>
          <PaymentCaptureForm
            creating={vm.loading}
            onCreate={async (payload) => {
              const created = await vm.createPayment(payload);
              // opcional: abrir print directo del recién creado
              setSelected([created]);
              setPrintOpen(true);
            }}
          />
        </div>
      </Card>

      <Card
        title="Historial de pagos"
        subtitle="Selecciona 1 para imprimir o varios para lote. Cancela con motivo."
        right={
          <div className={s.headerActions}>
            <Badge tone="info">{total} pagos</Badge>

            <Button
              variant="secondary"
              onClick={() => vm.refresh()}
              leftIcon={<RefreshCcw size={16} />}
            >
              Refrescar
            </Button>

            <Button
              onClick={() => setPrintOpen(true)}
              disabled={selected.length === 0}
              leftIcon={<Printer size={16} />}
            >
              Imprimir {selected.length > 1 ? 'lote' : 'comprobante'}
            </Button>
          </div>
        }
        className={s.right}
      >
        <div className={s.rightBody}>
          <div className={s.rightScroll}>
            <PaymentsHistoryTable
              items={vm.items}
              rawTotal={vm.raw.length}
              loading={vm.loading}
              error={vm.error}
              query={vm.query}
              setQuery={vm.setQuery}
              onRefresh={vm.refresh}
              selected={selected}
              setSelected={setSelected}
              onCancel={openCancel}
              onPrint={(p) => {
                setSelected([p]);
                setPrintOpen(true);
              }}
            />
          </div>
        </div>
      </Card>

      <CancelPaymentModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        payment={cancelTarget}
        onConfirm={async (motivo) => {
          if (!cancelTarget) return;
          await vm.cancelPayment(cancelTarget.id, motivo);
          setCancelOpen(false);
        }}
      />

      <PrintReceiptsModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        items={selected}
      />
    </div>
  );
}
