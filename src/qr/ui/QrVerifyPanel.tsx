'use client';

import { useMemo, useState } from 'react';
import { QrCode, Search } from 'lucide-react';
import Card from '@/shared/ui/Card/Card';
import Button from '@/shared/ui/Button/Button';
import Input from '@/shared/ui/Input/Input';
import Badge from '@/shared/ui/Badge/Badge';

import s from './QrVerifyPanel.module.css';
import { useQrVerify } from '../hooks/useQrVerify';
import { encodeReceiptQr } from '../utils/qr.codec';

export default function QrVerifyPanel() {
  const { state, verify, reset } = useQrVerify();
  const [value, setValue] = useState('');

  const hint = useMemo(() => {
    // tip para demo: si pegan folio, pueden usar encodeReceiptQr manualmente
    return 'Pega el contenido del QR (ej: USYC|000001) o usa un lector.';
  }, []);

  return (
    <Card
      title="Verificación de Recibo"
      subtitle="Valida la autenticidad de un recibo por QR (modo local)"
      right={
        <Badge tone="info">
          <QrCode size={14} /> QR
        </Badge>
      }
    >
      <div className={s.grid}>
        <div className={s.controls}>
          <Input
            label="Código QR"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="USYC|000001"
            hint={hint}
            leftIcon={<Search size={16} />}
          />

          <div className={s.actions}>
            <Button onClick={() => verify(value)} leftIcon={<QrCode size={16} />}>
              Verificar
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                setValue('');
                reset();
              }}
            >
              Limpiar
            </Button>
          </div>

          {/* Tip de demo */}
          <div className={s.demoTip}>
            Tip demo: si tienes un folio, su QR sería: <b>{encodeReceiptQr('000001')}</b>
          </div>
        </div>

        <div className={s.result}>
          {state.kind === 'idle' ? (
            <div className={s.placeholder}>Ingresa un código para verificar.</div>
          ) : state.kind === 'loading' ? (
            <div className={s.placeholder}>Verificando…</div>
          ) : state.kind === 'invalid' ? (
            <div className={s.box}>
              <Badge tone="danger">Inválido</Badge>
              <p>El código no tiene el formato esperado.</p>
            </div>
          ) : state.kind === 'not_found' ? (
            <div className={s.box}>
              <Badge tone="warn">No encontrado</Badge>
              <p>No existe un recibo con folio: <b>{state.folio}</b></p>
            </div>
          ) : state.kind === 'error' ? (
            <div className={s.box}>
              <Badge tone="danger">Error</Badge>
              <p>{state.message}</p>
            </div>
          ) : (
            <div className={s.box}>
              <Badge tone={state.kind === 'cancelled' ? 'warn' : 'ok'}>
                {state.kind === 'cancelled' ? 'Cancelado' : 'Válido'}
              </Badge>

              <div className={s.kv}>
                <div><span>Folio</span><b>{state.receipt.folio}</b></div>
                <div><span>Alumno</span><b>{state.receipt.alumno.nombre}</b></div>
                <div><span>Monto</span><b>${state.receipt.monto.toFixed(2)}</b></div>
                <div><span>Fecha</span><b>{state.receipt.fechaPago}</b></div>
                <div className={s.full}><span>Concepto</span><b>{state.receipt.concepto}</b></div>
                {state.kind === 'cancelled' && state.receipt.cancelReason ? (
                  <div className={s.full}>
                    <span>Motivo</span><b>{state.receipt.cancelReason}</b>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
