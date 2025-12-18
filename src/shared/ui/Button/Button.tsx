'use client';

import clsx from 'clsx';
import s from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}) {
  return (
    <button
      className={clsx(s.btn, s[variant], s[size], loading && s.loading, className)}
      disabled={props.disabled || loading}
      {...props}
    >
      {leftIcon ? <span className={s.icon}>{leftIcon}</span> : null}
      <span className={s.label}>{loading ? 'Procesando…' : children}</span>
      {rightIcon ? <span className={s.icon}>{rightIcon}</span> : null}
    </button>
  );
}
