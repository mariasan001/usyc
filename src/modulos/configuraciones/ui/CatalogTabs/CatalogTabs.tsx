// src/modules/configuraciones/catalogos/ui/CatalogTabs/CatalogTabs.tsx
'use client';

import s from './CatalogTabs.module.css';

export type CatalogKey = 'escolaridades' | 'carreras' | 'estatusRecibo';

export default function CatalogTabs({
  value,
  onChange,
}: {
  value: CatalogKey;
  onChange: (k: CatalogKey) => void;
}) {
  return (
    <div className={s.tabs}>
      <button
        className={`${s.tab} ${value === 'escolaridades' ? s.active : ''}`}
        onClick={() => onChange('escolaridades')}
      >
        Escolaridades
      </button>

      <button
        className={`${s.tab} ${value === 'carreras' ? s.active : ''}`}
        onClick={() => onChange('carreras')}
      >
        Carreras
      </button>

      <button
        className={`${s.tab} ${value === 'estatusRecibo' ? s.active : ''}`}
        onClick={() => onChange('estatusRecibo')}
      >
        Estatus Recibo
      </button>
    </div>
  );
}
