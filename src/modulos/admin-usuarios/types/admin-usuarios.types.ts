// src/modulos/admin-usuarios/types/admin-usuarios.types.ts

import type { RolUsuario } from '@/modulos/autenticacion/tipos/autenticacion.tipos';

/**
 * ✅ Roles disponibles en el UI para crear usuarios.
 * - El backend recibe roleIds (números).
 * - Este mapeo debe coincidir con la tabla/seed del backend.
 *
 * Si mañana cambian IDs, solo ajustas aquí y listo.
 */
export type RolOpcionUI = {
  rol: RolUsuario;
  roleId: number;
  label: string;
};

/**
 * ⚠️ Ajusta estos IDs según backend.
 * Ejemplo Swagger muestra roleIds: [1,2] sin describir.
 */
export type RolUi = {
  roleId: number;
  code: 'ADMIN' | 'CAJERO' | 'LECTOR';
  label: string;
};

export const ROLES_UI: RolUi[] = [
  { roleId: 1, code: 'ADMIN', label: 'Administrador' },
  { roleId: 2, code: 'CAJERO', label: 'Caja' },
  { roleId: 3, code: 'LECTOR', label: 'Consultor' },
];
/** Payload de creación (Swagger: POST /api/admin/users) */
export type CrearUsuarioPayload = {
  email: string;
  username: string;
  password: string;
  fullName: string;

  plantelId: number;

  /** Backend exige roleIds[] */
  roleIds: number[];
};

/** Respuesta de creación (Swagger "Usuario creado") */
export type UsuarioAdminDTO = {
  userId: number;
  email: string;
  username: string;
  fullName: string;
  active: boolean;

  alumnoId?: string | null;

  plantelId: number;
  roles: string[];
};

/** Payload de cambio de contraseña (Swagger: POST /api/admin/users/{userId}/password) */
export type CambiarContrasenaPayload = {
  currentPassword: string;
  newPassword: string;
};
