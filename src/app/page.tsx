'use client';

// src/app/page.tsx
// ✅ Página raíz (guard).
// - Si cookie válida => /auth/me responde user => redirige por rol.
// - Si cookie inválida/expirada => manda a iniciar sesión.
// ✅ También sincroniza localStorage para pintar UI rápido.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AutenticacionServicio } from '@/modulos/autenticacion/servicios/autenticacion.servicio';
import { destinoPorUsuario } from '@/modulos/autenticacion/utils/redireccion.utils';
import { guardarSesion, limpiarSesion } from '@/modulos/autenticacion/utils/sesion.utils';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let cancelado = false;

    async function run() {
      try {
        const me = await AutenticacionServicio.me();
        if (cancelado) return;

        guardarSesion({ usuario: me });
        router.replace(destinoPorUsuario(me));
      } catch {
        limpiarSesion();
        router.replace('/iniciar-sesion');
      }
    }

    run();

    return () => {
      cancelado = true;
    };
  }, [router]);

  return (
    <main style={{ padding: 24, color: 'var(--muted)' }}>
      Cargando…
    </main>
  );
}
