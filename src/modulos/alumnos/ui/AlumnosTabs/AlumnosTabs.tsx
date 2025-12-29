'use client';

import { List, UserPlus } from 'lucide-react';
import s from './AlumnosTabs.module.css';

export type AlumnosTabKey = 'directorio' | 'registro';

export default function AlumnosTabs({
  value,
  onChange,
}: {
  value: AlumnosTabKey;
  onChange: (next: AlumnosTabKey) => void;
}) {
  return (
    <div className={s.wrap} role="tablist" aria-label="Pestañas de alumnos">
      <button
        type="button"
        role="tab"
        aria-selected={value === 'directorio'}
        className={`${s.tab} ${value === 'directorio' ? s.active : ''}`}
        onClick={() => onChange('directorio')}
      >
        <List size={16} className={s.icon} />
        <span className={s.text}>Directorio</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={value === 'registro'}
        className={`${s.tab} ${value === 'registro' ? s.active : ''}`}
        onClick={() => onChange('registro')}
      >
        <UserPlus size={16} className={s.icon} />
        <span className={s.text}>Registrar alumno</span>
      </button>
    </div>
  );
}
