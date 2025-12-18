'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import Input from '@/shared/ui/Input/Input';
import Button from '@/shared/ui/Button/Button';
import s from './ReceiptForm.module.css';

import type { ReceiptCreateInput, StudentPlanDuration } from '../../types/receipt.types';

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

  // ✅ nuevos
  const [alumnoCarrera, setAlumnoCarrera] = useState('');
  const [alumnoDuracionMeses, setAlumnoDuracionMeses] = useState<StudentPlanDuration>(6);

  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState(todayISO());

  const canSubmit = useMemo(() => {
    if (!alumnoNombre.trim()) return false;
    if (!concepto.trim()) return false;

    // ✅ si capturas plan, exige carrera (duración ya trae default)
    if (alumnoCarrera.trim().length === 0) return false;

    const n = Number(monto);
    if (!Number.isFinite(n) || n <= 0) return false;

    if (!fechaPago) return false;
    return true;
  }, [alumnoNombre, concepto, monto, fechaPago, alumnoCarrera]);

  async function submit() {
    if (!canSubmit) return;

    const n = Number(monto);

    await onCreate({
      alumnoNombre: alumnoNombre.trim(),
      alumnoMatricula: alumnoMatricula.trim() || undefined,

      alumnoCarrera: alumnoCarrera.trim(),
      alumnoDuracionMeses,

      concepto: concepto.trim(),
      monto: n,
      fechaPago,
    });

    // reset suave (mantén fecha)
    setAlumnoNombre('');
    setAlumnoMatricula('');
    setAlumnoCarrera('');
    setAlumnoDuracionMeses(6);
    setConcepto('');
    setMonto('');
  }

  return (
    <div className={s.form}>
      <Input
        label="Nombre del alumno"
        placeholder="Ej: Diana Pérez"
        value={alumnoNombre}
        onChange={(e) => setAlumnoNombre(e.target.value)}
      />

      <Input
        label="Matrícula"
        placeholder="Ej: LEN-24-01"
        value={alumnoMatricula}
        onChange={(e) => setAlumnoMatricula(e.target.value)}
      />

      <Input
        label="Carrera"
        placeholder="Ej: Enfermería"
        value={alumnoCarrera}
        onChange={(e) => setAlumnoCarrera(e.target.value)}
      />

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Duración</label>
          <select
            className={s.select}
            value={alumnoDuracionMeses}
            onChange={(e) => setAlumnoDuracionMeses(Number(e.target.value) as StudentPlanDuration)}
          >
            <option value={6}>6 meses</option>
            <option value={12}>1 año (12 meses)</option>
            <option value={24}>2 años (24 meses)</option>
            <option value={36}>3 años (36 meses)</option>
            <option value={48}>4 años (48 meses)</option>
          </select>
        </div>

        <Input
          label="Fecha de pago"
          type="date"
          value={fechaPago}
          onChange={(e) => setFechaPago(e.target.value)}
        />
      </div>

      <Input
        label="Concepto de pago"
        placeholder="Ej: Colegiatura, Inscripción, Constancia…"
        value={concepto}
        onChange={(e) => setConcepto(e.target.value)}
      />

      <Input
        label="Importe ($)"
        placeholder="0.00"
        value={monto}
        inputMode="decimal"
        onChange={(e) => setMonto(e.target.value)}
      />

      <div className={s.actions}>
        <Button
          onClick={submit}
          disabled={!canSubmit}
          loading={creating}
          leftIcon={<Plus size={16} />}
        >
          Agregar Nuevo 
        </Button>
      </div>
    </div>
  );
}
