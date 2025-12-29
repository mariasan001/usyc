// src/modulos/configuraciones/ui/catalogo-modal/partes/InputMontoMXN.tsx
'use client';

import { useMemo, useState } from 'react';
import { parsearMXN } from '../utils/dineroMXN';
import s from './InputMontoMXN.module.css';

type Props = {
  /** Valor numérico real que vive en el form */
  value: number;
  /** Notifica cambios como número real */
  onChange: (n: number) => void;
  placeholder?: string;
};

/**
 * Input para montos MXN (sin setState en effects):
 * - Mientras escribes: NO formatea (mantiene el texto tal cual)
 * - En blur: formatea a "1,200.00"
 * - El estado que sube al formulario SIEMPRE es number
 *
 * Importante:
 * - NO usamos useEffect para sincronizar draft.
 * - Cuando NO se está editando, el input se pinta desde `value` (derivado).
 * - Cuando se está editando, el input se pinta desde `draft`.
 */
export default function InputMontoMXN({
  value,
  onChange,
  placeholder = '0.00',
}: Props) {
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<string>('');

  // Texto a mostrar cuando NO estamos editando:
  // - si value es 0 => vacío (igual que tu comportamiento original)
  const textoDerivado = useMemo(() => {
    return value ? String(value) : '';
  }, [value]);

  // El value que se pinta en el input:
  const valueMostrado = editando ? draft : textoDerivado;

  return (
    <input
      className={s.input}
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={valueMostrado}
      onFocus={() => {
        setEditando(true);
        // Al entrar, cargamos el draft con lo que hay visible (sin formatear).
        // Así el usuario puede seguir escribiendo sin brincos.
        setDraft(value ? String(value) : '');
      }}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        onChange(parsearMXN(next));
      }}
      onBlur={() => {
        setEditando(false);

        const n = parsearMXN(draft);
        onChange(n);

        // Importante:
        // NO necesitamos setDraft formateado aquí porque al salir de edición,
        // el input se pintará desde `textoDerivado` (que viene de value).
        // Si quieres que al salir se vea formateado, cambia textoDerivado a formatearMXN(value).
      }}
    />
  );
}
