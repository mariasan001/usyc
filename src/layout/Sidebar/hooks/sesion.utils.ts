import { RespuestaInicioSesion } from "@/modulos/autenticacion/tipos/autenticacion.tipos";

const KEY = 'usyc_sesion';
const EVENTO = 'usyc:sesion';

export function guardarSesion(s: RespuestaInicioSesion) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(EVENTO)); // ✅ misma pestaña
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
  window.dispatchEvent(new Event(EVENTO)); // ✅ misma pestaña
}

export const SESION_KEY = KEY;
export const SESION_EVENTO = EVENTO;
