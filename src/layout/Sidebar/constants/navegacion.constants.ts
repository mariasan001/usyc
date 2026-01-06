// src/layout/Sidebar/constants/navegacion.constants.ts
import { Users, Receipt, QrCode, Settings, Ban, UserCog } from 'lucide-react';
import type { ItemNavegacion } from '../types/navegacion.types';

export const ITEMS_NAVEGACION: ItemNavegacion[] = [
  { href: '/alumnos', label: 'Alumnos', icon: Users, grupo: 'GESTIÓN', roles: ['ADMIN', 'CAJERO', 'LECTOR'] },

  { href: '/corte-caja', label: 'Corte de caja', icon: Receipt, grupo: 'CAJA', roles: ['ADMIN', 'CAJERO', 'LECTOR'] },

  { href: '/cancelados', label: 'Cancelar recibo', icon: Ban, grupo: 'CAJA', roles: ['ADMIN', 'CAJERO'] },

  { href: '/verificar', label: 'Verificar QR', icon: QrCode, grupo: 'UTILIDADES', roles: ['ADMIN', 'CAJERO'] },

  // ✅ Admin-only
  { href: '/usuarios', label: 'Usuarios', icon: UserCog, grupo: 'SISTEMA', roles: ['ADMIN'] },

  { href: '/configuracion', label: 'Configuración', icon: Settings, grupo: 'SISTEMA', roles: ['ADMIN'] },
];

export const STORAGE_KEY_SIDEBAR = 'usyc.sidebar.collapsed';
