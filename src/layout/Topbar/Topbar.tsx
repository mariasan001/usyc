'use client';

import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

import s from './Topbar.module.css';

function metaFromPath(pathname: string) {
  if (pathname === '/') {
    return { title: 'Inicio', subtitle: 'Resumen rápido y accesos' };
  }
  if (pathname.startsWith('/recibos')) {
    return { title: 'Recibos', subtitle: 'Emite, consulta, imprime y cancela' };
  }
  if (pathname.startsWith('/alumnos')) {
    return { title: 'Centro de Alumnos', subtitle: 'Busca,crea alumnos ' };
  }
  if (pathname.startsWith('/verificar')) {
    return { title: 'Verificación QR', subtitle: 'Valida recibos por folio o QR' };
  }
  return { title: 'Panel', subtitle: '—' };
}

export default function Topbar() {
  const pathname = usePathname();
  const { title, subtitle } = metaFromPath(pathname);

  return (
    <header className={s.topbar}>
      <div className={s.left}>
        <h1 className={s.title}>{title}</h1>
        {subtitle !== '—' ? <p className={s.subtitle}>{subtitle}</p> : null}
      </div>

      <div className={s.right}>
        <div className={s.search}>
          <Search size={16} className={s.searchIcon} />
          <input
            className={s.searchInput}
            placeholder="Buscar folio, alumno o concepto…"
            aria-label="Buscar"
          />
        </div>
      </div>
    </header>
  );
}
