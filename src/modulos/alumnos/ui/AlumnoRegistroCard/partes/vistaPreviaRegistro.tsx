'use client';

import React from 'react';

type Props = {
  s: Record<string, string>;
  /** Si aplica programa (carrera/nivel) y por lo tanto tiene duración/termino */
  programaObligatorio: boolean;
  /** Duración total en meses (ej: 6, 12, 24...) */
  duracionMeses: number;
  /** Fecha término calculada (YYYY-MM-DD) o '—' */
  fechaTermino: string;
};

/**
 * Vista previa del registro
 * - Muestra valores calculados: duración (en meses) y fecha término.
 * - No decide reglas: SOLO pinta lo que le pasen.
 */
export default function VistaPreviaRegistro({
  s,
  programaObligatorio,
  duracionMeses,
  fechaTermino,
}: Props) {
  const meses = Number.isFinite(duracionMeses) ? duracionMeses : 0;

  return (
    <div className={s.preview}>
      <div className={s.previewItem}>
        <span className={s.previewLabel}>Duración</span>
        <span className={s.previewValue}>
          {programaObligatorio && meses > 0 ? `${meses} meses` : '—'}
        </span>
      </div>

      <div className={s.previewItem}>
        <span className={s.previewLabel}>Término</span>
        <span className={s.previewValue}>
          {programaObligatorio && meses > 0 ? fechaTermino : '—'}
        </span>
      </div>
    </div>
  );
}
