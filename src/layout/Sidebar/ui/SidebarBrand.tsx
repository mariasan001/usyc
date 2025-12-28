// src/layout/Sidebar/ui/SidebarBrand.tsx
import Image from 'next/image';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import s from '../Sidebar.module.css';

export default function SidebarBrand({
  collapsed,
  onToggle,
  subtitle,
}: {
  collapsed: boolean;
  onToggle: () => void;
  subtitle: string;
}) {
  return (
    <div className={s.top}>
      <div className={s.brand}>
        <div className={s.logoWrap}>
          <Image
            className={s.logo}
            src="/img/usyc-logo.png"
            alt="USYC"
            width={34}
            height={34}
            priority
          />
        </div>

        {!collapsed ? (
          <div className={s.brandText}>
            <div className={s.brandName}>USYC</div>
            <div className={s.brandSub}>{subtitle}</div>
          </div>
        ) : null}
      </div>

      <button
        className={s.collapseBtn}
        onClick={onToggle}
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        type="button"
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
    </div>
  );
}
