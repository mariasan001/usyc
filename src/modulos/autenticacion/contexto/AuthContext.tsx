'use client';

// src/modulos/autenticacion/contexto/AuthContext.tsx
// ✅ Estado global de autenticación para toda la app.
// ✅ Evita leer localStorage en cada módulo.
// ✅ Cookie-based auth: la verdad final vive en el backend.
//    - login: inicia cookie
//    - me: valida cookie
//    - logout: destruye cookie
//
// Front sólo guarda el "usuario" en localStorage para UI (sidebar, rutas, etc).

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { CredencialesInicioSesion, UsuarioSesion } from '../tipos/autenticacion.tipos';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';
import { guardarSesion, leerSesion, limpiarSesion } from '../utils/sesion.utils';
import { destinoPorUsuario } from '../utils/redireccion.utils';

type AuthState = {
  // ✅ listo: ya hidrató localStorage y puede pintar UI consistente
  listo: boolean;

  // ✅ cargando: usado para deshabilitar botones / mostrar loading
  cargando: boolean;

  // ✅ usuario actual (para UI)
  usuario: UsuarioSesion | null;

  // ✅ bandera de autenticación para UX rápida
  isAutenticado: boolean;

  // ✅ acciones principales
  login: (cred: CredencialesInicioSesion) => Promise<void>;
  logout: () => Promise<void>;
  refrescar: () => Promise<void>;

  // ✅ helpers para UI/guards
  tieneRol: (rol: string) => boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [listo, setListo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  // ✅ Hidratación inicial: solo para UI rápida (sidebar).
  //    La verificación real de autenticación es con /auth/me (refrescar()).
  useEffect(() => {
    const s = leerSesion();
    setUsuario(s?.usuario ?? null);
    setListo(true);
  }, []);

  // ✅ Helper: valida rol contra roles[] del backend
  function tieneRol(rol: string) {
    const roles = (usuario?.roles ?? []).map((r) => String(r).toUpperCase());
    return roles.includes(String(rol).toUpperCase());
  }

  // ✅ Valida sesión real: si cookie expiró => backend responde 401 => limpiamos y mandamos a login
  async function refrescar() {
    setCargando(true);
    try {
      const me = await AutenticacionServicio.me();

      // Guardamos para UI y sincronizamos estado
      guardarSesion({ usuario: me });
      setUsuario(me);
    } catch {
      // Cookie inválida/expirada
      limpiarSesion();
      setUsuario(null);
      router.replace('/iniciar-sesion');
    } finally {
      setCargando(false);
    }
  }

  // ✅ Login real: backend setea cookie.
  //    Guardamos el user devuelto para UI (sidebar + redirección)
  async function login(cred: CredencialesInicioSesion) {
    setCargando(true);
    try {
      const s = await AutenticacionServicio.iniciarSesion(cred);
      guardarSesion(s);
      setUsuario(s.usuario);

      // Redirección inicial por rol
      router.replace(destinoPorUsuario(s.usuario));
    } finally {
      setCargando(false);
    }
  }

  // ✅ Logout: backend destruye cookie. Aunque falle red, limpiamos UI.
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

  // ✅ Sin useMemo: evita warning de deps y no pasa nada (objeto pequeño)
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
