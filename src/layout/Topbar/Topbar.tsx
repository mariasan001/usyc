'use client';

import { usePathname } from 'next/navigation';
import { Search, WifiOff } from 'lucide-react';

import s from './Topbar.module.css';

function titleFromPath(pathname: string) {
  if (pathname === '/') return 'Inicio';
  if (pathname.startsWith('/recibos')) return 'Recibos';
  if (pathname.startsWith('/verificar')) return 'Verificación QR';
  return 'Panel';
}

export default function Topbar() {
  const pathname = usePathname();
  const title = titleFromPath(pathname);

  return (
    <header className={s.topbar}>
      <div className={s.left}>
        <h1 className={s.title}>{title}</h1>
        <div className={s.badge}>
          <WifiOff size={14} />
          <span>Offline</span>
        </div>
      </div>

      <div className={s.right}>
        <div className={s.search}>
          <Search size={16} />
          <input
            className={s.searchInput}
            placeholder="Buscar por folio o alumno…"
          />
        </div>
      </div>
    </header>
  );
}
