'use client';

import { useCallback, useMemo, useState } from 'react';

import s from './alumnos.page.module.css';

import AppShell from '@/layout/AppShell/AppShell';
import AlumnosTableCard from '@/modulos/alumnos/ui/AlumnosTableCard/AlumnosTableCard';
import AlumnoDrawer from '@/modulos/alumnos/ui/AlumnoDrawer/AlumnoDrawer';

import { useAlumnos } from '@/modulos/alumnos/hooks/useAlumnos';
import AlumnosTabs, { type AlumnosTabKey } from '@/modulos/alumnos/ui/AlumnosTabs/AlumnosTabs';

import { useAuth } from '@/modulos/autenticacion/contexto/AuthContext';
import type { Alumno } from '@/modulos/alumnos/types/alumno.types';
import AlumnoRegistroCard from '@/modulos/alumnos/ui/AlumnoRegistroCard/AlumnoRegistroCard';

export default function AlumnosPage() {
  const a = useAlumnos();
  const auth = useAuth();

  // ✅ Nuevo modelo de roles
  const isLector = auth.tieneRol('LECTOR');
  const canWrite = auth.tieneRol('ADMIN') || auth.tieneRol('CAJERO');

  const [tab, setTab] = useState<AlumnosTabKey>('directorio');

  /**
   * ✅ Estado de edición:
   * - Se llena cuando presionan "Editar" desde la tabla.
   * - Si es null => modo create.
   */
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);

  // ✅ LECTOR: siempre directorio (modo lectura)
  const effectiveTab = useMemo<AlumnosTabKey>(() => {
    if (isLector) return 'directorio';
    if (!canWrite && tab === 'registro') return 'directorio';
    return tab;
  }, [isLector, canWrite, tab]);

  /**
   * ✅ Cambio de tab manual (clic en tabs):
   * - Si el usuario navega por tabs, limpiamos edición (registro “fresh”).
   */
  const handleChangeTab = useCallback(
    (next: AlumnosTabKey) => {
      if (next !== tab) setEditingAlumno(null);
      setTab(next);
    },
    [tab],
  );

  /**
   * ✅ Editar desde tabla:
   * - Guarda el alumno y brinca al registro
   * - Ahí el form se precarga con initialAlumno
   */
  const handleEdit = useCallback(
    (alumno: Alumno) => {
      if (!canWrite) return;
      setEditingAlumno(alumno);
      setTab('registro');
    },
    [canWrite],
  );

  /** ✅ Cancelar edición: vuelve a directorio y limpia estado */
  const handleCancelEdit = useCallback(() => {
    setEditingAlumno(null);
    setTab('directorio');
  }, []);

  /** ✅ Guardado OK: vuelve a directorio, limpia y refresca tabla */
  const handleDone = useCallback(() => {
    setEditingAlumno(null);
    setTab('directorio');
    a.refresh();
  }, [a]);

  const isEditing = Boolean(editingAlumno);

  return (
    <AppShell>
      <div className={s.page}>
        {/* ✅ LECTOR: NO ve tabs */}
        {!isLector ? (
          <div className={s.topBar}>
            <AlumnosTabs value={effectiveTab} onChange={handleChangeTab} />
          </div>
        ) : null}

        <div className={s.content}>
          {/* ✅ Registro solo ADMIN/CAJERO */}
          {effectiveTab === 'registro' && canWrite ? (
            <div className={s.centerPane}>
              <AlumnoRegistroCard
                mode={isEditing ? 'edit' : 'create'}
                initialAlumno={editingAlumno}
                onCancelEdit={isEditing ? handleCancelEdit : undefined}
                onDone={handleDone}
              />
            </div>
          ) : (
            <AlumnosTableCard
              pageData={a.pageData}
              loading={a.loading}
              error={a.error}
              filters={a.filters}
              onChangeFilters={a.setFilters}
              onOpen={a.openDrawer}
              onEdit={handleEdit}
              onRefresh={a.refresh}
              onPageChange={a.onPageChange}
              canEdit={canWrite} // opcional (si quieres ocultar el botón editar en UI)
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
