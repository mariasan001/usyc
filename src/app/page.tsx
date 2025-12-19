

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { leerSesion } from '@/modulos/autenticacion/utils/sesion.utils';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const sesion = leerSesion();

    // Sin sesión => login
    if (!sesion?.token) {
      router.replace('/iniciar-sesion');
      return;
    }

    // Con sesión => redirección por rol
    const rol = sesion.usuario.rol;

    if (rol === 'ADMIN') {
      router.replace('/alumnos'); // o /inicio/dashboard si lo creas
      return;
    }

    if (rol === 'CAJA') {
      router.replace('/recibos'); // o /caja/historial-pagos
      return;
    }

    router.replace('/iniciar-sesion');
  }, [router]);

  // Pantalla mínima mientras decide
  return (
    <main style={{ padding: 24, color: 'var(--muted)' }}>
      Cargando…
    </main>
  );
}
