// src/layout/Topbar/Topbar.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

import s from './Topbar.module.css';
import { resolverMetaTopbar } from './utils/topbar.utils';

export default function Topbar() {
  const pathname = usePathname();
  const meta = resolverMetaTopbar(pathname);

  return (
    <header className={s.topbar}>
      <div className={s.left}>
        <h1 className={s.title}>{meta.title}</h1>
        {meta.subtitle ? <p className={s.subtitle}>{meta.subtitle}</p> : null}
      </div>

      <div className={s.right}>
        <div className={s.search}>
          <Search size={16} className={s.searchIcon} />
          <input
            className={s.searchInput}
            placeholder={meta.placeholder ?? 'Buscar…'}
            aria-label="Buscar"
          />
        </div>
      </div>
    </header>
  );
}
