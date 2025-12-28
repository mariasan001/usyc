// src/layout/Sidebar/Sidebar.tsx
'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

import s from './Sidebar.module.css';

import { ITEMS_NAVEGACION } from './constants/navegacion.constants';
import { agruparPorSeccion, filtrarPorRoles } from './utils/navegacion.utils';
import { useSidebarColapso } from './hooks/useSidebarColapso';

import SidebarBrand from './ui/SidebarBrand';
import SidebarNavGroup from './ui/SidebarNavGroup';
import SidebarCuenta from './ui/SidebarCuenta';
import SidebarFooter from './ui/SidebarFooter';

import { useAuth } from '@/modulos/autenticacion/contexto/AuthContext';
import type { RolUsuario } from '@/modulos/autenticacion/tipos/autenticacion.tipos';

const EMPTY_ROLES: RolUsuario[] = [];

function normalizarRoles(input: unknown): RolUsuario[] {
  // ✅ Esto evita el error de tipos y también cuida runtime
  const allowed: RolUsuario[] = ['ADMIN', 'CAJA', 'CONSULTOR'];

  if (!Array.isArray(input)) return EMPTY_ROLES;

  const roles = input.filter((r): r is RolUsuario => typeof r === 'string' && allowed.includes(r as RolUsuario));
  return roles.length ? roles : EMPTY_ROLES;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { collapsed, animating, toggle } = useSidebarColapso();

  // ✅ fuente única
  const { usuario, isAutenticado, logout } = useAuth();

  // ✅ roles estable (ya no se crea [] nuevo por render)
  const roles = useMemo(() => normalizarRoles(usuario?.roles), [usuario?.roles]);

  const groups = useMemo(() => {
    if (!isAutenticado) return [];
    const items = filtrarPorRoles(ITEMS_NAVEGACION, roles);
    return agruparPorSeccion(items);
  }, [isAutenticado, roles]);

  function cerrarSesion() {
    logout();
    router.push('/iniciar-sesion');
  }

  const subtitle = usuario?.plantelName ? `Sede: ${usuario.plantelName}` : 'Control escolar';
  const nombre = usuario?.fullName ?? 'Sistema';
  const meta = usuario ? `${usuario.username} • ${roles.join(', ') || '—'}` : 'Sin sesión';

  return (
    <aside className={clsx(s.sidebar, collapsed && s.collapsed)}>
      <SidebarBrand collapsed={collapsed} onToggle={toggle} subtitle={subtitle} />

      <nav className={s.nav} aria-label="Navegación principal">
        {groups.map(([titulo, items]) => (
          <SidebarNavGroup
            key={titulo}
            titulo={titulo}
            items={items}
            pathname={pathname}
            collapsed={collapsed}
            animating={animating}
          />
        ))}

        <SidebarCuenta collapsed={collapsed} animating={animating} onLogout={cerrarSesion} />
      </nav>

      <SidebarFooter collapsed={collapsed} animating={animating} nombre={nombre} meta={meta} />
    </aside>
  );
}
