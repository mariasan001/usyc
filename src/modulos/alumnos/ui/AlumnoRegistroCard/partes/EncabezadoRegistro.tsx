// src/modulos/alumnos/ui/alumno-registro-card/partes/EncabezadoRegistro.tsx
'use client';

type Css = Record<string, string>;

type Props = {
  s: Css;
  precioMensualLabel: string;
  precioMensualValor: string;
};

/**
 * Encabezado del card (título + KPI).
 * - Componente tonto: solo pinta texto.
 */
export default function EncabezadoRegistro({ s, precioMensualLabel, precioMensualValor }: Props) {
  return (
    <header className={s.header}>
      <div className={s.headText}>
        <h2 className={s.title}>Registro de alumno</h2>
        <p className={s.subtitle}>Captura rápida + cálculo automático (término y precio).</p>
      </div>

      <div className={s.kpi}>
        <span className={s.kpiLabel}>{precioMensualLabel}</span>
        <span className={s.kpiValue}>{precioMensualValor}</span>
      </div>
    </header>
  );
}
