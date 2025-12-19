// src/layout/Sidebar/types/navegacion.types.ts

import type { LucideIcon } from 'lucide-react';
import type { RolUsuario } from '@/modulos/autenticacion/tipos/autenticacion.tipos';

export type ItemNavegacion = {
  href: string;
  label: string;
  icon: LucideIcon;
  grupo?: string;
  roles?: RolUsuario[];
};
