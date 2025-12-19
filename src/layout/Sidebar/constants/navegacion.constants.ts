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
  { href: '/panel', label: 'Inicio', icon: LayoutDashboard, grupo: 'GENERAL', roles: ['DIRECTOR', 'CAJA'] },
  { href: '/alumnos', label: 'Alumnos', icon: Users, grupo: 'DIRECTOR', roles: ['DIRECTOR'] },
  { href: '/recibos', label: 'Historial de pagos', icon: Receipt, grupo: 'CAJA', roles: ['DIRECTOR', 'CAJA'] },
  { href: '/verificar', label: 'Verificar QR', icon: QrCode, grupo: 'UTILIDADES', roles: ['DIRECTOR', 'CAJA'] },
  { href: '/configuracion', label: 'Configuración', icon: Settings, grupo: 'SISTEMA', roles: ['DIRECTOR'] },
];

export const STORAGE_KEY_SIDEBAR = 'usyc.sidebar.collapsed';
