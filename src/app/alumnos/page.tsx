// src/app/alumnos/page.tsx
'use client';

import s from './alumnos.page.module.css';

import AlumnoRegistroCard from '@/modulos/alumnos/ui/AlumnoRegistroCard/AlumnoRegistroCard';
import AlumnosTableCard from '@/modulos/alumnos/ui/AlumnosTableCard/AlumnosTableCard';
import AlumnoDrawer from '@/modulos/alumnos/ui/AlumnoDrawer/AlumnoDrawer';

import { useAlumnos } from '@/modulos/alumnos/hooks/useAlumnos';
import AppShell from '@/layout/AppShell/AppShell';

export default function AlumnosPage() {
  const a = useAlumnos();

  return (
    <AppShell>
       <div className={s.page}>
      <div className={s.grid}>
        <div className={s.left}>
          <AlumnoRegistroCard onCreate={a.crearAlumno} />
        </div>

        <div className={s.right}>
          <AlumnosTableCard
            items={a.filtered}
            loading={a.loading}
            error={a.error}
            total={a.filtered.length}
            filters={a.filters}
            onChangeFilters={a.setFilters}
            onOpen={a.openDrawer}
            onRefresh={a.refresh}
          />
        </div>
      </div>

      <AlumnoDrawer open={a.drawerOpen} alumno={a.selected} onClose={a.closeDrawer} />
    </div>
    </AppShell>
   
  );
}
