// src/layout/Sidebar/Sidebar.tsx
'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

import s from './Sidebar.module.css';

import { limpiarSesion } from '@/modulos/autenticacion/utils/sesion.utils';

import { ITEMS_NAVEGACION } from './constants/navegacion.constants';
import { agruparPorSeccion, filtrarPorRol } from './utils/navegacion.utils';

import { useSidebarColapso } from './hooks/useSidebarColapso';
import { useRolSesion } from './hooks/useRolSesion';

import SidebarBrand from './ui/SidebarBrand';
import SidebarNavGroup from './ui/SidebarNavGroup';
import SidebarCuenta from './ui/SidebarCuenta';
import SidebarFooter from './ui/SidebarFooter';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { collapsed, animating, toggle } = useSidebarColapso();

  // ✅ Hook que lee la sesión desde localStorage y entrega rolActual
  const { sesion, rolActual } = useRolSesion();

  function cerrarSesion() {
    limpiarSesion();
    router.push('/iniciar-sesion');
  }

  // ✅ Filtra por rol + agrupa por sección
  const groups = useMemo(() => {
    const items = filtrarPorRol(ITEMS_NAVEGACION, rolActual);
    return agruparPorSeccion(items);
  }, [rolActual]);

  const nombre = sesion?.usuario?.nombre ?? 'Sistema';
  const meta = rolActual ? (rolActual === 'ADMIN' ? 'Administrador' : 'Caja') : 'Sin sesión';

  return (
    <aside className={clsx(s.sidebar, collapsed && s.collapsed)}>
      <SidebarBrand collapsed={collapsed} onToggle={toggle} />

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

        {/* ✅ CUENTA siempre visible */}
        <SidebarCuenta
          collapsed={collapsed}
          animating={animating}
          onLogout={cerrarSesion}
        />
      </nav>

      <SidebarFooter
        collapsed={collapsed}
        animating={animating}
        nombre={nombre}
        meta={meta}
      />
    </aside>
  );
}
