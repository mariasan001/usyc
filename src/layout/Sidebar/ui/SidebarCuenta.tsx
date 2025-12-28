// src/layout/Sidebar/ui/SidebarCuenta.tsx
import clsx from 'clsx';
import { LogOut } from 'lucide-react';
import s from '../Sidebar.module.css';

export default function SidebarCuenta({
  collapsed,
  animating,
  onLogout,
}: {
  collapsed: boolean;
  animating: boolean;
  onLogout: () => void;
}) {
  return (
    <div className={clsx(s.group, s.groupBottom)}>
      {!collapsed ? <div className={s.groupTitle}>CUENTA</div> : <div className={s.groupDivider} />}

      <div className={s.groupItems}>
        <div className={s.itemWrap}>
          <button type="button" onClick={onLogout} className={clsx(s.item, s.logout)}>
            <span className={s.iconWrap}>
              <LogOut size={18} className={s.icon} />
            </span>
            {!collapsed ? <span className={s.label}>Salir</span> : null}
          </button>

          {collapsed && !animating ? (
            <div className={s.tooltip} role="tooltip">
              Salir
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
