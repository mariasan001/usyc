// src/layout/Sidebar/hooks/useRolSesion.ts
'use client';

import { useEffect, useState } from 'react';
import type { RespuestaInicioSesion, RolUsuario } from '@/modulos/autenticacion/tipos/autenticacion.tipos';
import { leerSesion, SESION_EVENTO, SESION_KEY } from './sesion.utils';

export function useRolSesion() {
  // ✅ Lazy init: evita setState inmediato en useEffect (adiós warning)
  const [sesion, setSesion] = useState<RespuestaInicioSesion | null>(() => leerSesion());

  useEffect(() => {
    const sync = () => setSesion(leerSesion());

    // ✅ Cambios en esta pestaña (login/logout)
    window.addEventListener(SESION_EVENTO, sync);

    // ✅ Cambios desde otras pestañas
    function onStorage(e: StorageEvent) {
      if (e.key === SESION_KEY) sync();
    }
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(SESION_EVENTO, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const rolActual: RolUsuario | null = sesion?.usuario?.rol ?? null;

  return { sesion, rolActual };
}
