// src/modulos/autenticacion/servicios/autenticacion.servicio.ts

import type {
  CredencialesInicioSesion,
  RespuestaInicioSesion,
} from '../tipos/autenticacion.tipos';

export const AutenticacionServicio = {
  async iniciarSesion(
    payload: CredencialesInicioSesion
  ): Promise<RespuestaInicioSesion> {
    await new Promise((r) => setTimeout(r, 700));

    const u = payload.usuario.trim().toLowerCase();
    const p = payload.contrasena;

    if (u === 'admin' && p === '1234') {
      return {
        token: 'mock-token-admin',
        destino: '/panel',
        usuario: {
          id: 'u-001',
          nombre: 'Administrador',
          usuario: 'admin',
          rol: 'ADMIN',
        },
      };
    }

    if (u === 'caja' && p === '1234') {
      return {
        token: 'mock-token-caja',
        destino: '/recibos',
        usuario: {
          id: 'u-002',
          nombre: 'Caja USYC',
          usuario: 'caja',
          rol: 'CAJA',
        },
      };
    }

    throw new Error('Usuario o contraseña incorrectos');
  },
};
