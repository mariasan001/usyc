'use client';

import { DrawerTab } from '../../types/alumno-drawer.types';
import s from './DrawerTabs.module.css';

export default function DrawerTabs({
  tab,
  onChange,
}: {
  tab: DrawerTab;
  onChange: (t: DrawerTab) => void;
}) {
  return (
    <div className={s.tabs}>
      <button
        className={`${s.tab} ${tab === 'RESUMEN' ? s.active : ''}`}
        onClick={() => onChange('RESUMEN')}
      >
        Resumen
      </button>

      <button
        className={`${s.tab} ${tab === 'PROYECCION' ? s.active : ''}`}
        onClick={() => onChange('PROYECCION')}
      >
        Proyección
      </button>

      <button
        className={`${s.tab} ${tab === 'PAGOS' ? s.active : ''}`}
        onClick={() => onChange('PAGOS')}
      >
        Pagos
      </button>

      <button
        className={`${s.tab} ${tab === 'EXTRAS' ? s.active : ''}`}
        onClick={() => onChange('EXTRAS')}
      >
        Extras
      </button>
    </div>
  );
}
