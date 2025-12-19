// src/layout/Sidebar/ui/SidebarNavGroup.tsx

import Link from 'next/link';
import clsx from 'clsx';
import type { ItemNavegacion } from '../types/navegacion.types';
import { esActivo } from '../utils/navegacion.utils';
import s from '../Sidebar.module.css';

export default function SidebarNavGroup({
  titulo,
  items,
  pathname,
  collapsed,
  animating,
}: {
  titulo: string;
  items: ItemNavegacion[];
  pathname: string;
  collapsed: boolean;
  animating: boolean;
}) {
  return (
    <div className={s.group}>
      {!collapsed ? <div className={s.groupTitle}>{titulo}</div> : <div className={s.groupDivider} />}

      <div className={s.groupItems}>
        {items.map((it) => {
          const active = esActivo(pathname, it.href);
          const Icon = it.icon;

          return (
            <div key={it.href} className={s.itemWrap}>
              <Link
                href={it.href}
                className={clsx(s.item, active && s.active)}
                aria-current={active ? 'page' : undefined}
              >
                <span className={s.iconWrap}>
                  <Icon size={18} className={s.icon} />
                </span>
                {!collapsed ? <span className={s.label}>{it.label}</span> : null}
              </Link>

              {collapsed && !animating ? (
                <div className={s.tooltip} role="tooltip">
                  {it.label}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
