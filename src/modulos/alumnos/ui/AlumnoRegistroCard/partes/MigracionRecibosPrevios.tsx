// src/modulos/alumnos/ui/alumno-registro-card/partes/MigracionRecibosPrevios.tsx
'use client';

type Css = Record<string, string>;

type Props = {
  s: Css;
  enabled: boolean;
  onToggle: (v: boolean) => void;

  /** Nombre actual (se usa exacto para migrar) */
  nombre: string;

  /** Conteo detectado (si existe) */
  prevCount?: number | null;
};

/**
 * Bloque de “Recibos previos”.
 * - El usuario NO escribe tipoMonto ni nada aquí.
 * - Si está activo, muestra input bloqueado con el mismo nombre del registro.
 * - Mantiene tu UX actual (readOnly + disabled + hint).
 */
export default function MigracionRecibosPrevios({ s, enabled, onToggle, nombre, prevCount }: Props) {
  return (
    <div className={`${s.field} ${s.full}`}>
      <label className={s.label}>Recibos previos</label>

      <div className={s.inlineRow}>
        <input
          id="pullPrev"
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <label htmlFor="pullPrev" className={s.inlineLabel}>
          Migrar recibos previos
        </label>
      </div>

      {enabled ? (
        <div className={s.miniBlock}>
          <label className={s.label}>Nombre para recibos previos</label>

          <input
            className={`${s.input} ${s.inputLocked}`}
            value={nombre}
            readOnly
            disabled
            tabIndex={-1}
            autoComplete="off"
          />

          <div className={s.helperInfo}>
            Se usa exactamente el mismo nombre del registro para buscar/migrar recibos previos.
          </div>

          {typeof prevCount === 'number' && prevCount === 0 ? (
            <div className={s.helperWarn}>
              No hay recibos previos detectados para este nombre. Si continúas, probablemente no se migrará nada.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
