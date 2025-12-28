// src/modulos/autenticacion/utils/redireccion.utils.ts
// ✅ Decide destino inicial según roles.
// ✅ Por ahora es simple: ADMIN -> /panel, CAJA -> /recibos.
// ✅ A futuro podrás mapear roles por plantel o permisos finos.

import type { UsuarioSesion } from '../tipos/autenticacion.tipos';

export function destinoPorUsuario(u: UsuarioSesion) {
  const roles = (u.roles ?? []).map((r) => String(r).toUpperCase());

  if (roles.includes('ADMIN')) return '/panel';
  if (roles.includes('CAJA')) return '/recibos';

  // fallback
  return '/alumnos';
}
