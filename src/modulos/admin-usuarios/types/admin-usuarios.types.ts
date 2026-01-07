// src/modulos/admin-usuarios/types/admin-usuarios.types.ts

/** UI roles disponibles (radio) */
export const ROLES_UI = [
  { roleId: 1, roleCode: 'ADMIN', label: 'Administrador' },
  { roleId: 2, roleCode: 'CAJA', label: 'Caja' },
  { roleId: 3, roleCode: 'CONSULTOR', label: 'Consultor' },
] as const;

export type RolCodeUI = (typeof ROLES_UI)[number]['roleCode'];

/** DTO que regresa el backend en Admin Users (Swagger) */
export type UsuarioAdminDTO = {
  userId: number;
  email: string;
  username: string;
  fullName: string;

  active: boolean;

  // según swagger viene plantelId (number) y roles (string[])
  plantelId: number;
  roles: string[];

  // timestamps (pueden venir null/omitidos dependiendo el backend)
  lastLoginAt?: string | null;
  createdAt?: string | null;
};

/** Filtros GET /api/admin/users */
export type AdminUsuariosListParams = {
  plantelId?: number;          // query param
  active?: boolean;            // query param
  roleCode?: string;           // query param (ej ADMIN, CAJA, CONSULTOR)
  q?: string;                  // query param (username/email/fullName/alumnoId)
};

/** Payload crear usuario: POST /api/admin/users */
export type CrearUsuarioPayload = {
  email: string;
  username: string;
  password: string;
  fullName: string;
  plantelId: number;

  // backend espera arreglo, pero UI manda 1: [] o [id]
  roleIds: number[];
};

/** Payload cambiar contraseña: POST /api/admin/users/{id}/password */
export type CambiarContrasenaPayload = {
  currentPassword: string;
  newPassword: string;
};
