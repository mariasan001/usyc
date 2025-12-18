'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LayoutDashboard, Receipt, QrCode } from 'lucide-react';

import s from './Sidebar.module.css';

const navItems = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  { href: '/recibos', label: 'Recibos', icon: Receipt },
  { href: '/verificar', label: 'Verificar QR', icon: QrCode },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={s.sidebar}>
      <div className={s.brand}>
        <div className={s.logoWrap}>
          <img className={s.logo} src="/usyc-logo.png" alt="USYC" />
        </div>

        <div className={s.brandText}>
          <div className={s.brandName}>USYC</div>
          <div className={s.brandSub}>Control de Recibos • Local</div>
        </div>
      </div>

      <nav className={s.nav}>
        {navItems.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;

          return (
            <Link
              key={it.href}
              href={it.href}
              className={clsx(s.item, active && s.active)}
            >
              <Icon size={18} className={s.icon} />
              <span className={s.label}>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={s.footer}>
        <div className={s.pill}>Modo offline</div>
        <div className={s.hint}>Datos guardados localmente</div>
      </div>
    </aside>
  );
}
