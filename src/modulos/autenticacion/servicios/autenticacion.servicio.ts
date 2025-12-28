// src/modulos/autenticacion/servicios/autenticacion.servicio.ts
// ✅ Conecta con backend real usando tu api().
// ✅ Cookie-based: el backend setea cookie en login.
// ✅ /me valida cookie y devuelve usuario actual.
// ✅ logout destruye la sesión del lado del backend.

import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';

import type {
  CredencialesInicioSesion,
  RespuestaLoginApi,
  Sesion,
  UsuarioSesion,
} from '../tipos/autenticacion.tipos';

export const AutenticacionServicio = {
  async iniciarSesion(payload: CredencialesInicioSesion): Promise<Sesion> {
    const res = await api<RespuestaLoginApi>(API.auth.login, {
      method: 'POST',
      body: { username: payload.usuario, password: payload.contrasena },
    });

    // ✅ Guardamos solo user para UI
    return { usuario: res.user };
  },

  async me(): Promise<UsuarioSesion> {
    // ✅ Autoridad final: si cookie expiró => 401 => aquí truena
    return await api<UsuarioSesion>(API.auth.me, { method: 'GET' });
  },

  async logout(): Promise<void> {
    await api<void>(API.auth.logout, { method: 'POST' });
  },
};
