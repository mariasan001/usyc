// src/modulos/alumnos/ui/alumno-registro-card/partes/CampoTexto.tsx
'use client';

type Css = Record<string, string>;

type Props = {
  s: Css;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  type?: 'text' | 'date';
};

/**
 * Campo de texto estándar (label + input).
 * - Evita repetir markup y clases.
 */
export default function CampoTexto({
  s,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  type = 'text',
}: Props) {
  return (
    <div className={s.field}>
      <label className={s.label}>{label}</label>
      <input
        className={s.input}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </div>
  );
}
