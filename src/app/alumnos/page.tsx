'use client';

import { useMemo, useState } from 'react';

import s from './alumnos.page.module.css';

import AppShell from '@/layout/AppShell/AppShell';
import AlumnoRegistroCard from '@/modulos/alumnos/ui/AlumnoRegistroCard/AlumnoRegistroCard';
import AlumnosTableCard from '@/modulos/alumnos/ui/AlumnosTableCard/AlumnosTableCard';
import AlumnoDrawer from '@/modulos/alumnos/ui/AlumnoDrawer/AlumnoDrawer';

import { useAlumnos } from '@/modulos/alumnos/hooks/useAlumnos';
import AlumnosTabs, { type AlumnosTabKey } from '@/modulos/alumnos/ui/AlumnosTabs/AlumnosTabs';

import { useAuth } from '@/modulos/autenticacion/contexto/AuthContext';

export default function AlumnosPage() {
  const a = useAlumnos();
  const auth = useAuth();

  const isConsultor = auth.tieneRol('CONSULTOR');
  const canWrite = auth.tieneRol('ADMIN') || auth.tieneRol('CAJA');

  const [tab, setTab] = useState<AlumnosTabKey>('directorio');

  // ✅ CONSULTOR: siempre directorio (modo lectura)
  const effectiveTab = useMemo<AlumnosTabKey>(() => {
    if (isConsultor) return 'directorio';
    // por seguridad: si no puede escribir, tampoco debería entrar a registro
    if (!canWrite && tab === 'registro') return 'directorio';
    return tab;
  }, [isConsultor, canWrite, tab]);

  return (
    <AppShell>
      <div className={s.page}>
        {/* ✅ CONSULTOR: NO ve tabs */}
        {!isConsultor ? (
          <div className={s.topBar}>
            <AlumnosTabs value={effectiveTab} onChange={setTab} />
          </div>
        ) : null}

        <div className={s.content}>
          {/* ✅ Registro solo ADMIN/CAJA */}
          {effectiveTab === 'registro' && canWrite ? (
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

        {/* Drawer: CONSULTOR entra pero solo lectura */}
        <AlumnoDrawer
          open={a.drawerOpen}
          alumno={a.selected}
          onClose={a.closeDrawer}
          readOnly={isConsultor} // ✅ NUEVO PROP
        />
      </div>
    </AppShell>
  );
}
