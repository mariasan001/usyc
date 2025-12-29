// src/modulos/alumnos/ui/alumno-registro-card/partes/AlertasRegistro.tsx
'use client';

type Css = Record<string, string>;

type Props = {
  s: Css;
  error?: string | null;
  ok?: string | null;
};

/**
 * Alertas del formulario.
 * - Mantiene exactamente tus clases: alertError y alertOk.
 */
export default function AlertasRegistro({ s, error, ok }: Props) {
  return (
    <>
      {error ? <div className={s.alertError}>{error}</div> : null}
      {ok ? <div className={s.alertOk}>{ok}</div> : null}
    </>
  );
}
