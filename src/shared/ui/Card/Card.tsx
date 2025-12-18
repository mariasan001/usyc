import type { ReactNode } from 'react';
import clsx from 'clsx';
import s from './Card.module.css';

type Props = {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Card({
  title,
  subtitle,
  right,
  children,
  className,
}: Props) {
  return (
    <section className={clsx(s.card, className)}>
      {(title || subtitle || right) ? (
        <header className={s.header}>
          <div className={s.headText}>
            {title ? <h3 className={s.title}>{title}</h3> : null}
            {subtitle ? <p className={s.sub}>{subtitle}</p> : null}
          </div>

          {right ? <div className={s.right}>{right}</div> : null}
        </header>
      ) : null}

      <div className={s.body}>{children}</div>
    </section>
  );
}
