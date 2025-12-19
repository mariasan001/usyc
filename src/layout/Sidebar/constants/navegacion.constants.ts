// src/layout/Sidebar/constants/navegacion.constants.ts

import {
  LayoutDashboard,
  Users,
  Receipt,
  QrCode,
  Settings,
} from 'lucide-react';

import type { ItemNavegacion } from '../types/navegacion.types';

export const ITEMS_NAVEGACION: ItemNavegacion[] = [
  { href: '/panel', label: 'Inicio', icon: LayoutDashboard, grupo: 'GENERAL', roles: ['ADMIN'] },

  { href: '/alumnos', label: 'Alumnos', icon: Users, grupo: 'GESTIÓN', roles: ['ADMIN','CAJA'] },

  { href: '/recibos', label: 'Historial de pagos', icon: Receipt, grupo: 'CAJA', roles: ['ADMIN','CAJA'] },

  { href: '/verificar', label: 'Verificar QR', icon: QrCode, grupo: 'UTILIDADES', roles: ['ADMIN','CAJA'] },

  { href: '/configuracion', label: 'Configuración', icon: Settings, grupo: 'SISTEMA', roles: ['ADMIN'] },
];

export const STORAGE_KEY_SIDEBAR = 'usyc.sidebar.collapsed';
