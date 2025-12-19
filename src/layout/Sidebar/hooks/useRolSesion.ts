// src/layout/Sidebar/hooks/useRolSesion.ts

import { useMemo } from 'react';
import { leerSesion } from '@/modulos/autenticacion/utils/sesion.utils';
import type { RolUsuario } from '@/modulos/autenticacion/tipos/autenticacion.tipos';

export function useRolSesion() {
  const sesion = useMemo(() => leerSesion(), []);
  const rolActual: RolUsuario | null = sesion?.usuario?.rol ?? null;

  return { sesion, rolActual };
}
