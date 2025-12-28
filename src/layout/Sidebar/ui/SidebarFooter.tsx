// src/layout/Sidebar/ui/SidebarFooter.tsx
import clsx from 'clsx';
import { UserRound } from 'lucide-react';
import s from '../Sidebar.module.css';

export default function SidebarFooter({
  collapsed,
  animating,
  nombre,
  meta,
}: {
  collapsed: boolean;
  animating: boolean;
  nombre: string;
  meta: string;
}) {
  return (
    <div className={s.footer}>
      <div className={s.profileRow}>
        <span className={s.profileIcon}>
          <UserRound size={16} />
        </span>

        {!collapsed ? (
          <div className={s.profileText}>
            <div className={s.profileName}>{nombre}</div>
            <div className={s.profileMeta}>{meta}</div>
          </div>
        ) : (
          !animating && (
            <div className={clsx(s.tooltip, s.tooltipFooter)} role="tooltip">
              {nombre} • {meta}
            </div>
          )
        )}
      </div>
    </div>
  );
}
