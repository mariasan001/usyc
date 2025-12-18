import type { ReactNode } from 'react';

import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import s from './AppShell.module.css';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={s.shell}>
      <Sidebar />
      <div className={s.main}>
        <Topbar />
        <main className={s.content}>{children}</main>
      </div>
    </div>
  );
}
