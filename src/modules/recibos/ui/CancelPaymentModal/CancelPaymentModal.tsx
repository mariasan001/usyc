// src/features/receipts/ui/modals/CancelPaymentModal/CancelPaymentModal.tsx
'use client';

import { useMemo, useState } from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import Button from '@/shared/ui/Button/Button';
import Input from '@/shared/ui/Input/Input';

import s from './CancelPaymentModal.module.css';
import { Payment } from '../../types/payment.types';

export default function CancelPaymentModal({
  open,
  onClose,
  payment,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
  onConfirm: (motivo: string) => Promise<void>;
}) {
  const [motivo, setMotivo] = useState('');

  const disabled = useMemo(() => !motivo.trim(), [motivo]);

  async function submit() {
    if (!payment) return;
    await onConfirm(motivo.trim());
    setMotivo('');
  }

  return (
    <Modal open={open} onClose={onClose} title="">
      {!payment ? null : (
        <div className={s.body}>
          <div className={s.title}>Cancelar pago</div>
          <div className={s.sub}>
            Folio <b>{payment.folio}</b> • {payment.alumnoNombre}
          </div>

          <Input
            label="Motivo de cancelación"
            placeholder="Ej: Pago duplicado / Error de monto / Reverso…"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />

          <div className={s.actions}>
            <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            <Button onClick={submit} disabled={disabled}>Cancelar pago</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
