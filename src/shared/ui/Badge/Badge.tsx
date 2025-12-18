    import clsx from 'clsx';
import s from './Badge.module.css';

type Tone = 'neutral' | 'ok' | 'warn' | 'danger' | 'info';

export default function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={clsx(s.badge, s[tone], className)}>{children}</span>;
}
