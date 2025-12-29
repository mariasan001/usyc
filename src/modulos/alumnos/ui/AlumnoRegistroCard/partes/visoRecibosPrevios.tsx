// src/modulos/alumnos/ui/alumno-registro-card/partes/AvisoRecibosPrevios.tsx
'use client';

type Css = Record<string, string>;

type Props = {
  s: Css;
  nombre: string;
  loading: boolean;
  error?: string | null;
  count?: number | null;
};

/**
 * Aviso de recibos previos:
 * - Se muestra solo si el nombre tiene longitud suficiente.
 * - Mantiene exactamente la lógica original del render.
 */
export default function AvisoRecibosPrevios({ s, nombre, loading, error, count }: Props) {
  const visible = nombre.trim().length >= 6;
  if (!visible) return null;

  return (
    <div className={`${s.full} ${s.prevBox}`}>
      {loading ? (
        <div className={s.prevInfo}>Buscando recibos previos…</div>
      ) : error ? (
        <div className={s.prevWarn}>{error}</div>
      ) : typeof count === 'number' ? (
        count > 0 ? (
          <div className={s.prevOk}>
            Se encontraron <b>{count}</b> recibos previos para este nombre.
            <span className={s.prevHint}>
              Si deseas, activa “Migrar recibos previos” para vincular el historial.
            </span>
          </div>
        ) : (
          <div className={s.prevInfo}>No se encontraron recibos previos para este nombre.</div>
        )
      ) : null}
    </div>
  );
}
