// src/modulos/autenticacion/tipos/autenticacion.tipos.ts
// ✅ Tipos reales, mínimos, alineados al Swagger.
// ✅ NO asumimos token porque tu response de /login NO lo muestra.
// ✅ Guardamos el user para UI (roles + plantel).

export type CredencialesInicioSesion = {
  usuario: string;
  contrasena: string;
};

export type UsuarioSesion = {
  userId: number;
  username: string;
  fullName: string;
  active: boolean;
  roles: string[];

  plantelId?: number;
  plantelName?: string;
};

export type RespuestaLoginApi = {
  message?: string;
  user: UsuarioSesion;
};

// ✅ Sesión local (solo para UI)
//    La autenticación real la sostiene el backend con cookie.
export type Sesion = {
  usuario: UsuarioSesion;
};
