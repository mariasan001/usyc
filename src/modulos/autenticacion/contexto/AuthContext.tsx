'use client';

// src/modulos/autenticacion/contexto/AuthContext.tsx
// ✅ Estado global de autenticación para toda la app (UI).
// ✅ Cookie-based auth: la verdad vive en backend.
//    - login: setea cookie + devuelve user
//    - me: valida cookie y devuelve user (o 401)
//    - logout: destruye cookie
//
// Front guarda Sesion (usuario) en localStorage SOLO para UI (sidebar, rutas).

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { CredencialesInicioSesion, RolUsuario, Sesion, UsuarioSesion } from '../tipos/autenticacion.tipos';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';
import { guardarSesion, leerSesion, limpiarSesion } from '../utils/sesion.utils';
import { destinoPorUsuario } from '../utils/redireccion.utils';

/** Roles válidos hoy (si mañana crecen, agregas aquí y en tipos) */
const ROLES_VALIDOS: RolUsuario[] = ['ADMIN', 'CAJERO', 'LECTOR'];
/** Normaliza roles: asegura RolUsuario[] aunque backend mande strings */
function normalizarRoles(input: unknown): RolUsuario[] {
  if (!Array.isArray(input)) return [];
  return input.filter(
    (r): r is RolUsuario => typeof r === 'string' && ROLES_VALIDOS.includes(r as RolUsuario)
  );
}

/** Normaliza usuario: evita basura en roles */
function normalizarUsuario(u: UsuarioSesion): UsuarioSesion {
  const rolesUnknown = (u as unknown as { roles?: unknown }).roles;
  return {
    ...u,
    roles: normalizarRoles(rolesUnknown),
  };
}

type AuthState = {
  listo: boolean;
  cargando: boolean;

  usuario: UsuarioSesion | null;
  isAutenticado: boolean;

  login: (cred: CredencialesInicioSesion) => Promise<void>;
  logout: () => Promise<void>;
  refrescar: () => Promise<void>;

  tieneRol: (rol: RolUsuario) => boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [listo, setListo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  /**
   * ✅ Hidratación inicial (UI)
   * - pinta sidebar rápido usando localStorage
   * - la verificación real se hace con refrescar() ( /auth/me )
   */
  useEffect(() => {
    const s = leerSesion(); // Sesion | null
    const u = s?.usuario ? normalizarUsuario(s.usuario) : null;
    setUsuario(u);
    setListo(true);
  }, []);

  function tieneRol(rol: RolUsuario) {
    return Boolean(usuario?.roles?.includes(rol));
  }

  /**
   * ✅ Refresca sesión REAL con backend
   * - Si cookie expiró => 401 => limpiamos UI y redirigimos
   */
  async function refrescar() {
    setCargando(true);
    try {
      const meRaw = await AutenticacionServicio.me(); // UsuarioSesion
      const me = normalizarUsuario(meRaw);

      const sesion: Sesion = { usuario: me };
      guardarSesion(sesion);

      setUsuario(me);
    } catch {
      limpiarSesion();
      setUsuario(null);
      router.replace('/iniciar-sesion');
    } finally {
      setCargando(false);
    }
  }

  /**
   * ✅ Login real
   * - backend setea cookie
   * - servicio devuelve Sesion ( { usuario } )
   */
  async function login(cred: CredencialesInicioSesion) {
    setCargando(true);
    try {
      const s = await AutenticacionServicio.iniciarSesion(cred); // ✅ Sesion
      const u = s?.usuario ? normalizarUsuario(s.usuario) : null;

      if (!u) throw new Error('Respuesta inválida de inicio de sesión');

      // Guardamos sesión UI + sincronizamos estado
      const sesion: Sesion = { usuario: u };
      guardarSesion(sesion);
      setUsuario(u);

      // redirect por rol
      router.replace(destinoPorUsuario(u));
    } finally {
      setCargando(false);
    }
  }

  /**
   * ✅ Logout
   * - backend destruye cookie
   * - aunque falle, limpiamos UI
   */
  async function logout() {
    setCargando(true);
    try {
      await AutenticacionServicio.logout();
    } catch {
      // no bloqueamos por red
    } finally {
      limpiarSesion();
      setUsuario(null);
      setCargando(false);
      router.replace('/iniciar-sesion');
    }
  }

  const value: AuthState = {
    listo,
    cargando,
    usuario,
    isAutenticado: Boolean(usuario),

    login,
    logout,
    refrescar,

    tieneRol,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
