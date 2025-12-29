'use client';

import { useState } from 'react';

import s from './alumnos.page.module.css';

import AppShell from '@/layout/AppShell/AppShell';
import AlumnoRegistroCard from '@/modulos/alumnos/ui/AlumnoRegistroCard/AlumnoRegistroCard';
import AlumnosTableCard from '@/modulos/alumnos/ui/AlumnosTableCard/AlumnosTableCard';
import AlumnoDrawer from '@/modulos/alumnos/ui/AlumnoDrawer/AlumnoDrawer';

import { useAlumnos } from '@/modulos/alumnos/hooks/useAlumnos';
import AlumnosTabs, { type AlumnosTabKey } from '@/modulos/alumnos/ui/AlumnosTabs/AlumnosTabs';

export default function AlumnosPage() {
  const a = useAlumnos();
  const [tab, setTab] = useState<AlumnosTabKey>('directorio');

  return (
    <AppShell>
      <div className={s.page}>
        <div className={s.topBar}>
          <AlumnosTabs value={tab} onChange={setTab} />
        </div>

        <div className={s.content}>
          {tab === 'registro' ? (
            <div className={s.centerPane}>
              <AlumnoRegistroCard />
            </div>
          ) : (
            <AlumnosTableCard
              pageData={a.pageData}
              loading={a.loading}
              error={a.error}
              filters={a.filters}
              onChangeFilters={a.setFilters}
              onOpen={a.openDrawer}
              onRefresh={a.refresh}
              onPageChange={a.onPageChange}
            />
          )}
        </div>

        <AlumnoDrawer open={a.drawerOpen} alumno={a.selected} onClose={a.closeDrawer} />
      </div>
    </AppShell>
  );
}
