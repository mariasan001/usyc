'use client';

import clsx from 'clsx';
import s from './Input.module.css';

export default function Input({
  label,
  hint,
  error,
  leftIcon,
  className,
  inputClassName,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
}) {
  const hasError = Boolean(error);

  return (
    <label className={clsx(s.field, className)}>
      {label ? <span className={s.label}>{label}</span> : null}

      <span className={clsx(s.control, hasError && s.error)}>
        {leftIcon ? <span className={s.icon}>{leftIcon}</span> : null}
        <input className={clsx(s.input, inputClassName)} {...props} />
      </span>

      {hasError ? <span className={s.msgError}>{error}</span> : hint ? <span className={s.msgHint}>{hint}</span> : null}
    </label>
  );
}
