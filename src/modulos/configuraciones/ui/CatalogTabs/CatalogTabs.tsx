'use client';

import {
  GraduationCap,
  BookOpen,
  BadgeCheck,
  Receipt,
  CreditCard,
} from 'lucide-react';

import s from './CatalogTabs.module.css';

export type CatalogKey =
  | 'escolaridades'
  | 'carreras'
  | 'estatusRecibo'
  | 'conceptosPago'
  | 'tiposPago';

type Props = {
  value: CatalogKey;
  onChange: (k: CatalogKey) => void;
};

const TABS: Array<{
  key: CatalogKey;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { key: 'escolaridades', label: 'Escolaridades', Icon: GraduationCap },
  { key: 'carreras', label: 'Carreras', Icon: BookOpen },
  { key: 'estatusRecibo', label: 'Estatus de recibo', Icon: BadgeCheck },
  { key: 'conceptosPago', label: 'Conceptos de pago', Icon: Receipt },
  { key: 'tiposPago', label: 'Tipos de pago', Icon: CreditCard },
];

export default function CatalogTabs({ value, onChange }: Props) {
  return (
    <div className={s.wrap} aria-label="Catálogos">
      <div className={s.tabs} role="tablist">
        {TABS.map(({ key, label, Icon }) => {
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
              {isActive ? <span className={s.dot} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
