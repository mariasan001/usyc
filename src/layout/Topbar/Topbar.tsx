'use client';

// src/layout/Topbar/Topbar.tsx

import { usePathname } from 'next/navigation';
import { LogOut, ChevronDown } from 'lucide-react';

import s from './Topbar.module.css';
import { resolverMetaTopbar } from './utils/topbar.utils';
import { useAuth } from '@/modulos/autenticacion/contexto/AuthContext';

export default function Topbar() {
  const pathname = usePathname();
  const meta = resolverMetaTopbar(pathname);

  const { usuario, logout } = useAuth();

  const rol = usuario?.roles?.[0] ?? null;
  const sede = usuario?.plantelName ?? 'GLOBAL';
  const inicial = usuario?.fullName?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <header className={s.topbar}>
      <div className={s.left}>
        <h1 className={s.title}>{meta.title}</h1>
        {meta.subtitle ? <p className={s.subtitle}>{meta.subtitle}</p> : null}
      </div>

      {usuario ? (
        <div className={s.right}>
          <div className={s.context}>
            <span className={s.badge}>{sede}</span>
            {rol ? <span className={s.badgeSoft}>{rol}</span> : null}
          </div>

          <div className={s.userMenu}>
            <div className={s.avatar}>{inicial}</div>
            <button
              className={s.logout}
              onClick={logout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
