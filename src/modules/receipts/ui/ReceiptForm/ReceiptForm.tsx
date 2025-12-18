'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import Input from '@/shared/ui/Input/Input';
import Button from '@/shared/ui/Button/Button';
import s from './ReceiptForm.module.css';

import type { ReceiptCreateInput } from '../../types/receipt.types';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReceiptForm({
  onCreate,
  creating,
}: {
  onCreate: (input: ReceiptCreateInput) => Promise<any>;
  creating?: boolean;
}) {
  const [alumnoNombre, setAlumnoNombre] = useState('');
  const [alumnoMatricula, setAlumnoMatricula] = useState('');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState(todayISO());

  const canSubmit = useMemo(() => {
    if (!alumnoNombre.trim()) return false;
    if (!concepto.trim()) return false;
    const n = Number(monto);
    if (!Number.isFinite(n) || n <= 0) return false;
    if (!fechaPago) return false;
    return true;
  }, [alumnoNombre, concepto, monto, fechaPago]);

  async function submit() {
    if (!canSubmit) return;

    const n = Number(monto);
    await onCreate({
      alumnoNombre: alumnoNombre.trim(),
      alumnoMatricula: alumnoMatricula.trim() || undefined,
      concepto: concepto.trim(),
      monto: n,
      fechaPago,
    });

    // reset suave (mantén fecha de hoy)
    setAlumnoNombre('');
    setAlumnoMatricula('');
    setConcepto('');
    setMonto('');
  }

  return (
    <div className={s.form}>
      <Input
        label="Alumno"
        placeholder="Nombre completo"
        value={alumnoNombre}
        onChange={(e) => setAlumnoNombre(e.target.value)}
      />

      <Input
        label="Matrícula (opcional)"
        placeholder="Ej: A001"
        value={alumnoMatricula}
        onChange={(e) => setAlumnoMatricula(e.target.value)}
      />

      <Input
        label="Concepto"
        placeholder="Ej: Colegiatura, Inscripción, Constancia…"
        value={concepto}
        onChange={(e) => setConcepto(e.target.value)}
      />

      <div className={s.row}>
        <Input
          label="Monto"
          placeholder="0.00"
          value={monto}
          inputMode="decimal"
          onChange={(e) => setMonto(e.target.value)}
        />

        <Input
          label="Fecha de pago"
          type="date"
          value={fechaPago}
          onChange={(e) => setFechaPago(e.target.value)}
        />
      </div>

      <div className={s.actions}>
        <Button
          onClick={submit}
          disabled={!canSubmit}
          loading={creating}
          leftIcon={<Plus size={16} />}
        >
          Generar recibo
        </Button>
      </div>
    </div>
  );
}
