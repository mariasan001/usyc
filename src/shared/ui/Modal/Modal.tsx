'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';
import s from './Modal.module.css';

export default function Modal({
  open,
  title,
  children,
  onClose,
  className,
}: {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const hasTitle = Boolean(title && title.trim().length > 0);

  return createPortal(
    <div className={s.backdrop} onMouseDown={onClose}>
      <div
        className={clsx(s.modal, className)}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* ✅ Header SOLO si hay title */}
        {hasTitle ? (
          <header className={s.header}>
            <div className={s.titleWrap}>
              <h3 className={s.title}>{title}</h3>
            </div>

            <button className={s.close} onClick={onClose} aria-label="Cerrar" type="button">
              <X size={18} />
            </button>
          </header>
        ) : (
          // ✅ Si no hay title, botón flotante (sin hueco arriba)
          <button
            className={s.floatingClose}
            onClick={onClose}
            aria-label="Cerrar"
            type="button"
          >
            <X size={18} />
          </button>
        )}

        {/* ✅ Body scrolleable real */}
        <div className={s.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
