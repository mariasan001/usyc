// src/layout/Sidebar/constants/navegacion.constants.ts

import { Users, Receipt, QrCode, Settings, LayoutDashboard, FileText } from 'lucide-react';
import type { ItemNavegacion } from '../types/navegacion.types';

export const ITEMS_NAVEGACION: ItemNavegacion[] = [
  // ✅ Panel solo ADMIN (si luego lo usas)
  // { href: '/panel', label: 'Inicio', icon: LayoutDashboard, grupo: 'GENERAL', roles: ['ADMIN'] },

  // ✅ Gestión (todos ven, acciones se controlan aparte)
  { href: '/alumnos', label: 'Alumnos', icon: Users, grupo: 'GESTIÓN', roles: ['ADMIN', 'CAJA', 'CONSULTOR'] },

  // ✅ Recibos (si lo reactivas)
  // { href: '/recibos', label: 'Recibos', icon: Receipt, grupo: 'CAJA', roles: ['ADMIN', 'CAJA', 'CONSULTOR'] },

  // ✅ Reportes (si lo agregas más adelante)
  // { href: '/reportes', label: 'Reportes', icon: FileText, grupo: 'GESTIÓN', roles: ['ADMIN', 'CAJA', 'CONSULTOR'] },

  // ✅ Utilidades
  { href: '/verificar', label: 'Verificar QR', icon: QrCode, grupo: 'UTILIDADES', roles: ['ADMIN', 'CAJA', 'CONSULTOR'] },

  // ✅ Sistema (solo ADMIN)
  { href: '/configuracion', label: 'Configuración', icon: Settings, grupo: 'SISTEMA', roles: ['ADMIN'] },
];

// ✅ esto sí se queda (es UI, no auth)
export const STORAGE_KEY_SIDEBAR = 'usyc.sidebar.collapsed';
