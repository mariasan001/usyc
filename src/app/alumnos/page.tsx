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

  // ✅ Nuevo modelo de roles
  const isLector = auth.tieneRol('LECTOR');
  const canWrite = auth.tieneRol('ADMIN') || auth.tieneRol('CAJERO');

  const [tab, setTab] = useState<AlumnosTabKey>('directorio');

  // ✅ LECTOR: siempre directorio (modo lectura)
  const effectiveTab = useMemo<AlumnosTabKey>(() => {
    if (isLector) return 'directorio';
    // por seguridad: si no puede escribir, tampoco debería entrar a registro
    if (!canWrite && tab === 'registro') return 'directorio';
    return tab;
  }, [isLector, canWrite, tab]);

  return (
    <AppShell>
      <div className={s.page}>
        {/* ✅ LECTOR: NO ve tabs */}
        {!isLector ? (
          <div className={s.topBar}>
            <AlumnosTabs value={effectiveTab} onChange={setTab} />
          </div>
        ) : null}

        <div className={s.content}>
          {/* ✅ Registro solo ADMIN/CAJERO */}
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

        {/* Drawer: LECTOR entra pero solo lectura */}
        <AlumnoDrawer
          open={a.drawerOpen}
          alumno={a.selected}
          onClose={a.closeDrawer}
          readOnly={isLector}
        />
      </div>
    </AppShell>
  );
}
