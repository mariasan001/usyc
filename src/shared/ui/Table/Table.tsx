import clsx from 'clsx';
import s from './Table.module.css';

export default function Table({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx(s.wrap, className)}>
      <table className={s.table}>{children}</table>
    </div>
  );
}
