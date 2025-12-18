'use client';

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Receipt,
  QrCode,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
} from 'lucide-react';

import s from './Sidebar.module.css';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group?: string;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard, group: 'GENERAL' },
  { href: '/recibos', label: 'Recibos', icon: Receipt, group: 'CAJA' },
  { href: '/verificar', label: 'Verificar QR', icon: QrCode, group: 'CAJA' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

const STORAGE_KEY = 'usyc.sidebar.collapsed';

// evita warning SSR con layoutEffect
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [animating, setAnimating] = useState(false);

  // ✅ 1) Lee storage + setea dataset ANTES de pintar (adiós flash)
  useIsoLayoutEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) === '1';
      setCollapsed(saved);
      document.documentElement.dataset.sidebarCollapsed = saved ? '1' : '0';
    } catch {
      // ignore
    }
  }, []);

  // ✅ 2) Persistencia normal
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [collapsed]);

  const groups = useMemo(() => {
    const map = new Map<string, NavItem[]>();
    for (const it of navItems) {
      const g = it.group ?? 'MENÚ';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }
    return Array.from(map.entries());
  }, []);

  function toggle() {
    const next = !collapsed;

    // ✅ clave: actualiza el layout INMEDIATO (sin esperar al effect)
    document.documentElement.dataset.sidebarCollapsed = next ? '1' : '0';

    setAnimating(true);
    setCollapsed(next);
    window.setTimeout(() => setAnimating(false), 260);
  }

  return (
    <aside className={clsx(s.sidebar, collapsed && s.collapsed)}>
      <div className={s.top}>
        <div className={s.brand}>
          <div className={s.logoWrap}>
            <img className={s.logo} src="/img/usyc-logo.png" alt="USYC" />
          </div>

          {!collapsed ? (
            <div className={s.brandText}>
              <div className={s.brandName}>USYC</div>
              <div className={s.brandSub}>Control de Recibos</div>
            </div>
          ) : null}
        </div>

        <button
          className={s.collapseBtn}
          onClick={toggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          type="button"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className={s.nav} aria-label="Navegación principal">
        {groups.map(([groupName, items]) => (
          <div key={groupName} className={s.group}>
            {!collapsed ? (
              <div className={s.groupTitle}>{groupName}</div>
            ) : (
              <div className={s.groupDivider} />
            )}

            <div className={s.groupItems}>
              {items.map((it) => {
                const active = isActive(pathname, it.href);
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
        ))}
      </nav>

      <div className={s.footer}>
        <div className={s.profileRow}>
          <span className={s.profileIcon}>
            <UserRound size={16} />
          </span>

          {!collapsed ? (
            <div className={s.profileText}>
              <div className={s.profileName}>Control escolar</div>
              <div className={s.profileMeta}>Administrador</div>
            </div>
          ) : (
            !animating && (
              <div className={clsx(s.tooltip, s.tooltipFooter)} role="tooltip">
                Control escolar • Administrador
              </div>
            )
          )}
        </div>
      </div>
    </aside>
  );
}
