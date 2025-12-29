// src/modulos/alumnos/ui/alumno-registro-card/partes/SelectCatalogo.tsx
'use client';

import type React from 'react';

type Css = Record<string, string>;

type Option = { value: string; label: string };

type Props = {
  s: Css;
  label: React.ReactNode;
  value: string | number;
  onChange: (raw: string) => void;
  options: Option[];
  disabled?: boolean;
  placeholder: string;
  errorText?: string | null;
  full?: boolean;
};

/**
 * Select genérico para catálogos.
 * - Mantiene estructura/clases del card.
 * - `value` se guarda como string en el <select> y se convierte afuera (en el card).
 */
export default function SelectCatalogo({
  s,
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder,
  errorText,
  full,
}: Props) {
  return (
    <div className={`${s.field} ${full ? s.full : ''}`}>
      <label className={s.label}>{label}</label>

      <select
        className={s.select}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>

        {options.map((x) => (
          <option key={x.value} value={x.value}>
            {x.label}
          </option>
        ))}
      </select>

      {errorText ? <div className={s.helperError}>{errorText}</div> : null}
    </div>
  );
}
