'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import AppShell from '@/layout/AppShell/AppShell';
import s from './cancelados.page.module.css';

import { useAuth } from '@/modulos/autenticacion/contexto/AuthContext';
import CanceladosTableCard from '@/modulos/cancelados/ui/CanceladosTableCard/CanceladosTableCard';

export default function CanceladosPage() {
  const router = useRouter();
  const { listo, tieneRol } = useAuth();

  // ✅ Roles nuevos
  const canSee = tieneRol('ADMIN') || tieneRol('CAJERO');

  useEffect(() => {
    if (!listo) return;
    if (!canSee) router.replace('/alumnos');
  }, [listo, canSee, router]);

  if (!listo) return null;
  if (!canSee) return null;

  return (
    <AppShell>
      <div className={s.page}>
        <div className={s.grid}>
          <CanceladosTableCard />
        </div>
      </div>
    </AppShell>
  );
}
