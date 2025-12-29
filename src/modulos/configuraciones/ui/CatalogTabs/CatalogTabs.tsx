'use client';

import s from './CatalogTabs.module.css';

import { TABS_CATALOGOS } from './data/catalogoTabs.data';
import type { CatalogKey } from './types/catalogoTabs.types';

type Props = {
  /** Catálogo actualmente seleccionado */
  value: CatalogKey;
  /** Cambia el tab activo */
  onChange: (k: CatalogKey) => void;
};

/**
 * Tabs de Configuraciones → Catálogos
 *
 * Reglas:
 * - UI pura (sin lógica de negocio).
 * - Las pestañas viven en `data/catalogoTabs.data.ts`.
 * - Si mañana agregas un catálogo, solo editas el array TABS_CATALOGOS.
 */
export default function CatalogoTabs({ value, onChange }: Props) {
  return (
    <div className={s.wrap} aria-label="Catálogos">
      <div className={s.tabs} role="tablist">
        {TABS_CATALOGOS.map(({ key, label, Icon }) => {
          const isActive = value === key;

          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${s.tab} ${isActive ? s.active : ''}`}
              onClick={() => onChange(key)}
            >
              <Icon size={16} className={s.icon} />
              <span className={s.label}>{label}</span>
              {isActive ? <span className={s.dot} aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
