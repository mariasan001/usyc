// src/features/receipts/ui/PaymentCaptureForm/PaymentCaptureForm.tsx
'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import Input from '@/shared/ui/Input/Input';
import Button from '@/shared/ui/Button/Button';

import s from './PaymentCaptureForm.module.css';
import type { Payment } from '../../types/payment.types';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PaymentCaptureForm({
  onCreate,
  creating,
}: {
  onCreate: (input: Omit<Payment, 'id' | 'folio' | 'estatus' | 'motivoCancelacion'>) => Promise<any>;
  creating?: boolean;
}) {
  const [alumnoNombre, setAlumnoNombre] = useState('');
  const [alumnoMatricula, setAlumnoMatricula] = useState('');
  const [carrera, setCarrera] = useState('');
  const [fecha, setFecha] = useState(todayISO());
  const [valor, setValor] = useState('');
  const [concepto, setConcepto] = useState('Colegiatura');

  const canSubmit = useMemo(() => {
    if (!alumnoNombre.trim()) return false;
    if (!carrera.trim()) return false;
    if (!fecha) return false;
    if (!concepto.trim()) return false;

    const n = Number(valor);
    if (!Number.isFinite(n) || n <= 0) return false;

    return true;
  }, [alumnoNombre, carrera, fecha, valor, concepto]);

  async function submit() {
    if (!canSubmit) return;

    await onCreate({
      alumnoNombre: alumnoNombre.trim(),
      alumnoMatricula: alumnoMatricula.trim() || null,
      carrera: carrera.trim(),
      fecha,
      valor: Number(valor),
      concepto: concepto.trim(),
    });

    setAlumnoNombre('');
    setAlumnoMatricula('');
    setCarrera('');
    setFecha(todayISO());
    setValor('');
    setConcepto('Colegiatura');
  }

  return (
    <div className={s.form}>
      <div className={s.fields}>
        <div className={s.span2}>
          <Input
            label="Alumno"
            placeholder="Ej: Diana Pérez"
            value={alumnoNombre}
            onChange={(e) => setAlumnoNombre(e.target.value)}
          />
        </div>

        <Input
          label="Matrícula"
          placeholder="Ej: LEN-24-01"
          value={alumnoMatricula}
          onChange={(e) => setAlumnoMatricula(e.target.value)}
        />

        <Input
          label="Carrera"
          placeholder="Ej: Enfermería"
          value={carrera}
          onChange={(e) => setCarrera(e.target.value)}
        />

        <Input
          label="Fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <Input
          label="Valor ($)"
          placeholder="0.00"
          value={valor}
          inputMode="decimal"
          onChange={(e) => setValor(e.target.value)}
        />

        <Input
          label="Concepto"
          placeholder="Ej: Colegiatura"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
        />

        <div className={s.span2}>
          <div className={s.hint}>
            Se creará el <b>folio</b> y podrás <b>imprimir</b> desde el historial.
          </div>
        </div>
      </div>

      <div className={s.actions}>
        <Button onClick={submit} disabled={!canSubmit} loading={creating} leftIcon={<Plus size={16} />}>
          Registrar pago
        </Button>
      </div>
    </div>
  );
}
