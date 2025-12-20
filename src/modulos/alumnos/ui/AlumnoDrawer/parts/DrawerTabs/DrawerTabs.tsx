'use client';

import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  PlusCircle,
} from 'lucide-react';

import type { DrawerTab } from '../../types/alumno-drawer.types';
import s from './DrawerTabs.module.css';

const TABS: {
  key: DrawerTab;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { key: 'RESUMEN', label: 'Resumen', Icon: LayoutDashboard },
  { key: 'PROYECCION', label: 'Proyección', Icon: TrendingUp },
  { key: 'PAGOS', label: 'Pagos', Icon: Receipt },
  { key: 'EXTRAS', label: 'Extras', Icon: PlusCircle },
];

export default function DrawerTabs({
  tab,
  onChange,
}: {
  tab: DrawerTab;
  onChange: (t: DrawerTab) => void;
}) {
  return (
    <nav className={s.wrap} aria-label="Secciones del alumno">
      <div className={s.tabs} role="tablist" aria-orientation="horizontal">
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key;

          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-current={active ? 'page' : undefined}
              className={`${s.tab} ${active ? s.active : ''}`}
              onClick={() => onChange(key)}
              title={label}
            >
              <span className={s.iconWrap} aria-hidden="true">
                <Icon size={16} className={s.icon} />
              </span>
              <span className={s.label}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
