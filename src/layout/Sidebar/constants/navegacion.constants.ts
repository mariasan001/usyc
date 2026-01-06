// src/layout/Sidebar/constants/navegacion.constants.ts

import { Users, Receipt, QrCode, Settings, Ban } from 'lucide-react';
import type { ItemNavegacion } from '../types/navegacion.types';

export const ITEMS_NAVEGACION: ItemNavegacion[] = [
  // ✅ Gestión (todos ven, acciones se controlan aparte)
  { href: '/alumnos', label: 'Alumnos', icon: Users, grupo: 'GESTIÓN', roles: ['ADMIN', 'CAJA', 'CONSULTOR'] },

  // ✅ Caja
  { href: '/corte-caja', label: 'Corte de caja', icon: Receipt, grupo: 'CAJA', roles: ['ADMIN', 'CAJA', 'CONSULTOR'] },

  { href: '/cancelados', label: 'Cancelar recibo', icon: Ban, grupo: 'CAJA', roles: ['ADMIN', 'CAJA'] },

  // ✅ Utilidades
  { href: '/verificar', label: 'Verificar QR', icon: QrCode, grupo: 'UTILIDADES', roles: ['ADMIN', 'CAJA'] },

  // ✅ Sistema (solo ADMIN)
  { href: '/configuracion', label: 'Configuración', icon: Settings, grupo: 'SISTEMA', roles: ['ADMIN'] },
];

// ✅ esto sí se queda (es UI, no auth)
export const STORAGE_KEY_SIDEBAR = 'usyc.sidebar.collapsed';
