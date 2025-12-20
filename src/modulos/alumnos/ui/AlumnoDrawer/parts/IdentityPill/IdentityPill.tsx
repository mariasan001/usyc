'use client';

import s from './IdentityPill.module.css';

function estadoLabel(activo: boolean) {
  return activo ? 'Activo' : 'Egresado';
}

export default function IdentityPill({
  nombreCompleto,
  matricula,
  activo,
}: {
  nombreCompleto: string;
  matricula: string;
  activo: boolean;
}) {
  const letter = (nombreCompleto?.trim()?.[0] ?? 'A').toUpperCase();

  return (
    <div className={s.identity}>
      <div className={s.avatar}>{letter}</div>

      <div className={s.identityMain}>
        <div className={s.identityName} title={nombreCompleto}>
          {nombreCompleto || '—'}
        </div>

        <div className={s.identityMeta}>
          <span className={s.mono}>{matricula || '—'}</span>
          <span className={s.dot}>•</span>
          <span className={`${s.pill} ${activo ? s.pillOk : s.pillIdle}`}>
            {estadoLabel(!!activo)}
          </span>
        </div>
      </div>
    </div>
  );
}
