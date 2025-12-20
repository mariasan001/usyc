// src/app/alumnos/page.tsx
'use client';

import s from './alumnos.page.module.css';

import AppShell from '@/layout/AppShell/AppShell';
import AlumnoRegistroCard from '@/modulos/alumnos/ui/AlumnoRegistroCard/AlumnoRegistroCard';
import AlumnosTableCard from '@/modulos/alumnos/ui/AlumnosTableCard/AlumnosTableCard';
import AlumnoDrawer from '@/modulos/alumnos/ui/AlumnoDrawer/AlumnoDrawer';

import { useAlumnos } from '@/modulos/alumnos/hooks/useAlumnos';

export default function AlumnosPage() {
  const a = useAlumnos();

  return (
    <AppShell>
      <div className={s.page}>
        <div className={s.grid}>
          <div className={s.left}>
            <AlumnoRegistroCard />
            {/* si tu registro debe usar a.crearAlumno, lo conectamos en el card */}
          </div>

          <div className={s.right}>
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
          </div>
        </div>

        <AlumnoDrawer open={a.drawerOpen} alumno={a.selected} onClose={a.closeDrawer} />
      </div>
    </AppShell>
  );
}
