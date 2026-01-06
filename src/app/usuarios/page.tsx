'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import s from './usuarios.page.module.css';

import { useAuth } from '@/modulos/autenticacion/contexto/AuthContext';
import { useAdminUsuarios } from '@/modulos/admin-usuarios/hooks/useAdminUsuarios';

import AdminUsuariosCreateCard from '@/modulos/admin-usuarios/ui/AdminUsuariosCreateCard/AdminUsuariosCreateCard';
import AdminUsuariosPasswordCard from '@/modulos/admin-usuarios/ui/AdminUsuariosPasswordCard/AdminUsuariosPasswordCard';
import AppShell from '@/layout/AppShell/AppShell';

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { listo, tieneRol } = useAuth();

  const esAdmin = tieneRol('ADMIN');

  const {
    busy,
    error,
    ok,
    ultimoCreado,
    crearUsuario,
    cambiarContrasena,
    limpiarMensajes,
  } = useAdminUsuarios();

  // ✅ Guard UI: si no es admin, lo mandamos fuera
  useEffect(() => {
    if (!listo) return;
    if (!esAdmin) router.replace('/alumnos');
  }, [listo, esAdmin, router]);

  if (!listo) return null;

  return (
        <AppShell>
    
    <main className={s.page}>
      <header className={s.header}>
        <div className={s.title}>Admin · Usuarios</div>
        <div className={s.subtitle}>
          Operaciones administrativas: creación y cambio de contraseña.
        </div>
      </header>

      {error ? (
        <div
          className={s.alertError}
          onClick={limpiarMensajes}
          role="button"
          tabIndex={0}
          title="Click para cerrar"
        >
          {error}
        </div>
      ) : null}

      {ok ? (
        <div
          className={s.alertOk}
          onClick={limpiarMensajes}
          role="button"
          tabIndex={0}
          title="Click para cerrar"
        >
          {ok}
        </div>
      ) : null}

      <section className={s.grid}>
        <AdminUsuariosCreateCard
          busy={busy}
          onSubmit={async (payload) => {
            await crearUsuario(payload);
          }}
        />

        <AdminUsuariosPasswordCard
          busy={busy}
          onSubmit={async (userId, payload) => {
            await cambiarContrasena(userId, payload);
          }}
        />
      </section>

      {ultimoCreado ? (
        <section className={s.createdBox}>
          <div className={s.createdTitle}>Último usuario creado</div>
          <div className={s.createdGrid}>
            <div>
              <b>userId:</b> {ultimoCreado.userId}
            </div>
            <div>
              <b>username:</b> {ultimoCreado.username}
            </div>
            <div>
              <b>fullName:</b> {ultimoCreado.fullName}
            </div>
            <div>
              <b>email:</b> {ultimoCreado.email}
            </div>
          </div>
        </section>
      ) : null}
    </main>
    </AppShell>
  );
}
