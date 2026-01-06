// src/modulos/admin-usuarios/services/admin-usuarios.service.ts

import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';

import type {
  CambiarContrasenaPayload,
  CrearUsuarioPayload,
  UsuarioAdminDTO,
} from '../types/admin-usuarios.types';

/**
 * Servicio Admin · Usuarios
 * - Solo ADMIN debería poder usarlo (UI lo oculta por rol).
 * - La seguridad REAL la impone el backend.
 */
export const AdminUsuariosService = {
  /**
   * Crea usuario:
   * POST /api/admin/users
   */
  crear: (payload: CrearUsuarioPayload) =>
    api<UsuarioAdminDTO>(API.admin.usuarios.crear, {
      method: 'POST',
      body: payload,
    }),

  /**
   * Cambiar contraseña:
   * POST /api/admin/users/{userId}/password
   */
  cambiarContrasena: (userId: number, payload: CambiarContrasenaPayload) =>
    api<void>(API.admin.usuarios.cambiarContrasena(userId), {
      method: 'POST',
      body: payload,
    }),
} as const;
