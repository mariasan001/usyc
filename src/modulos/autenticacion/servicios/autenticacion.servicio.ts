// src/modulos/autenticacion/servicios/autenticacion.servicio.ts

import type {
  CredencialesInicioSesion,
  RespuestaInicioSesion,
} from '../tipos/autenticacion.tipos';

/**
 * Servicio de autenticación (MOCK)
 * - En esta etapa no se consume API real.
 * - Cuando llegue backend, solo reemplazamos este archivo por fetch/axios.
 */
export const AutenticacionServicio = {
  async iniciarSesion(payload: CredencialesInicioSesion): Promise<RespuestaInicioSesion> {
    // Simula latencia real
    await new Promise((r) => setTimeout(r, 700));

    const u = payload.usuario.trim().toLowerCase();
    const p = payload.contrasena;

    // Credenciales de prueba (cámbialas cuando quieras)
    if (u === 'director' && p === '1234') {
      return {
        token: 'mock-token-director',
        usuario: {
          id: 'u-001',
          nombre: 'Director General',
          usuario: 'director',
          rol: 'DIRECTOR',
        },
      };
    }

    if (u === 'caja' && p === '1234') {
      return {
        token: 'mock-token-caja',
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
