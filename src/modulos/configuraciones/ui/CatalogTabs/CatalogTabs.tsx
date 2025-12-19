// src/modules/configuraciones/catalogos/ui/CatalogTabs/CatalogTabs.tsx
'use client';

import s from './CatalogTabs.module.css';

export type CatalogKey = 'escolaridades' | 'carreras' | 'estatusRecibo';

type Props = {
  value: CatalogKey;
  onChange: (k: CatalogKey) => void;
};

const TABS: Array<{ key: CatalogKey; label: string }> = [
  { key: 'escolaridades', label: 'Escolaridades' },
  { key: 'carreras', label: 'Carreras' },
  { key: 'estatusRecibo', label: 'Estatus Recibo' },
];

export default function CatalogTabs({ value, onChange }: Props) {
  return (
    <div className={s.tabs} role="tablist" aria-label="Catálogos">
      {TABS.map((t) => {
        const isActive = value === t.key;

        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${s.tab} ${isActive ? s.active : ''}`}
            onClick={() => onChange(t.key)}
            disabled={isActive} // opcional, puedes quitarlo si no te gusta
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
