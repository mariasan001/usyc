// src/modulos/autenticacion/tipos/autenticacion.tipos.ts

// Roles conocidos por el front (pueden crecer después)
export type RolUsuario = 'ADMIN' | 'CAJA' | 'CONSULTOR';

// Credenciales que envía el formulario
export type CredencialesInicioSesion = {
  usuario: string;
  contrasena: string;
};

// Usuario que devuelve el backend
export type UsuarioSesion = {
  userId: number;
  username: string;
  fullName: string;
  active: boolean;

  // Backend manda array
  roles: RolUsuario[];

  plantelId?: number;
  plantelName?: string;
};

// Respuesta REAL de POST /auth/login
export type RespuestaLoginApi = {
  message?: string;
  user: UsuarioSesion;
};

// Sesión local (solo UI, NO seguridad)
export type Sesion = {
  usuario: UsuarioSesion;
};
