'use client';

import s from './DrawerHeader.module.css';

export default function DrawerHeader({
  title = 'Detalle financiero',
  subtitle = 'Proyección completa, historial y recibos.',
  onClose,
}: {
  title?: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <header className={s.header}>
      <div className={s.headerText}>
        <div className={s.title}>{title}</div>
        <div className={s.subtitle}>{subtitle}</div>
      </div>

      <button className={s.close} onClick={onClose} aria-label="Cerrar">
        ✕
      </button>
    </header>
  );
}
