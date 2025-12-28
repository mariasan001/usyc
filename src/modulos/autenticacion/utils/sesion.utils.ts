// src/modulos/autenticacion/utils/sesion.utils.ts
// ✅ Guarda en localStorage SOLO lo necesario para UI (usuario/roles/plantel).
// ✅ NO guarda token porque el auth real vive en cookie httpOnly.
// ✅ Esto evita re-llamar /me para cada render del sidebar (pero /me sigue siendo autoridad final).

import type { Sesion } from '../tipos/autenticacion.tipos';

const KEY = 'usyc:sesion';

export function guardarSesion(s: Sesion) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function leerSesion(): Sesion | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    const s = JSON.parse(raw) as Sesion;
    if (!s?.usuario) return null;
    return s;
  } catch {
    return null;
  }
}

export function limpiarSesion() {
  localStorage.removeItem(KEY);
}
