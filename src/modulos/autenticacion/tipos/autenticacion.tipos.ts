// src/modulos/autenticacion/tipos/autenticacion.tipos.ts

export type RolUsuario = 'DIRECTOR' | 'CAJA';

export type CredencialesInicioSesion = {
  usuario: string;
  contrasena: string;
};

export type UsuarioSesion = {
  id: string;
  nombre: string;
  usuario: string;
  rol: RolUsuario;
};

export type RespuestaInicioSesion = {
  token: string;
  destino: string; // ✅ nuevo: a dónde redirigir después del login
  usuario: UsuarioSesion;
};
