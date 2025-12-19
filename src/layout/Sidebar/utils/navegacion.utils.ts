// src/layout/Sidebar/utils/navegacion.utils.ts

import type { ItemNavegacion } from '../types/navegacion.types';
import type { RolUsuario } from '@/modulos/autenticacion/tipos/autenticacion.tipos';

export function esActivo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

export function filtrarPorRol(items: ItemNavegacion[], rolActual: RolUsuario | null) {
  // ✅ si no hay rol (sin sesión), no mostramos el menú
  if (!rolActual) return [];

  return items.filter((it) => {
    if (!it.roles || it.roles.length === 0) return true;
    return it.roles.includes(rolActual);
  });
}

export function agruparPorSeccion(items: ItemNavegacion[]) {
  const map = new Map<string, ItemNavegacion[]>();

  for (const it of items) {
    const g = it.grupo ?? 'MENÚ';
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(it);
  }

  return Array.from(map.entries()) as Array<[string, ItemNavegacion[]]>;
}
