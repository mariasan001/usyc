// src/modulos/autenticacion/utils/sesion.utils.ts
import type { RespuestaInicioSesion } from '../tipos/autenticacion.tipos';

const KEY = 'usyc_sesion';

export function guardarSesion(s: RespuestaInicioSesion) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function leerSesion(): RespuestaInicioSesion | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as RespuestaInicioSesion;
  } catch {
    return null;
  }
}

export function limpiarSesion() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
