// src/modulos/autenticacion/servicios/autenticacion.servicio.ts

import type {
  CredencialesInicioSesion,
  RespuestaInicioSesion,
} from '../tipos/autenticacion.tipos';

/**
 * Servicio de autenticación (MOCK)
 * - En esta etapa no se consume API real.
 * - Cuando llegue backend, reemplazas este archivo por fetch/axios.
 * - Centraliza el destino del login (por ahora: siempre /panel).
 */
export const AutenticacionServicio = {
  async iniciarSesion(
    payload: CredencialesInicioSesion
  ): Promise<RespuestaInicioSesion> {
    // Simula latencia real
    await new Promise((r) => setTimeout(r, 700));

    const usuario = payload.usuario.trim().toLowerCase();
    const contrasena = payload.contrasena;

    // ✅ Regla actual: sin importar rol, todos entran al mismo panel
    const destino = '/panel';

    // Credenciales de prueba (cámbialas cuando quieras)
    if (usuario === 'director' && contrasena === '1234') {
      return {
        token: 'mock-token-director',
        destino,
        usuario: {
          id: 'u-001',
          nombre: 'Director General',
          usuario: 'director',
          rol: 'DIRECTOR',
        },
      };
    }

    if (usuario === 'caja' && contrasena === '1234') {
      return {
        token: 'mock-token-caja',
        destino,
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
