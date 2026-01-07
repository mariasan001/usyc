// src/modulos/admin-usuarios/services/admin-usuarios.service.ts

import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';

import type {
  AdminUsuariosListParams,
  CambiarContrasenaPayload,
  CrearUsuarioPayload,
  UsuarioAdminDTO,
} from '../types/admin-usuarios.types';

/**
 * Servicio Admin · Usuarios
 * - UI solo lo muestra a ADMIN, pero el backend manda.
 */
export const AdminUsuariosService = {
  /**
   * Listar usuarios
   * GET /api/admin/users?plantelId&active&roleCode&q
   */
  listar: (params?: AdminUsuariosListParams) =>
    api<UsuarioAdminDTO[]>(API.admin.usuarios.listar(params), {
      method: 'GET',
    }),

  /**
   * Crear usuario
   * POST /api/admin/users
   */
  crear: (payload: CrearUsuarioPayload) =>
    api<UsuarioAdminDTO>(API.admin.usuarios.crear, {
      method: 'POST',
      body: payload,
    }),

  /**
   * Cambiar contraseña
   * POST /api/admin/users/{userId}/password
   */
  cambiarContrasena: (userId: number, payload: CambiarContrasenaPayload) =>
    api<void>(API.admin.usuarios.cambiarContrasena(userId), {
      method: 'POST',
      body: payload,
    }),
} as const;
