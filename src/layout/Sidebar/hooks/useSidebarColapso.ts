// src/layout/Sidebar/hooks/useSidebarColapso.ts
'use client';

import { useEffect, useState } from 'react';
import { STORAGE_KEY_SIDEBAR } from '../constants/navegacion.constants';

function leerColapsoInicial(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY_SIDEBAR) === '1';
  } catch {
    return false;
  }
}

export function useSidebarColapso() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const v = leerColapsoInicial();
    if (typeof window !== 'undefined') {
      document.documentElement.dataset.sidebarCollapsed = v ? '1' : '0';
    }
    return v;
  });

  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SIDEBAR, collapsed ? '1' : '0');
      document.documentElement.dataset.sidebarCollapsed = collapsed ? '1' : '0';
    } catch {}
  }, [collapsed]);

  function toggle() {
    setAnimating(true);
    setCollapsed((prev) => !prev);
    window.setTimeout(() => setAnimating(false), 260);
  }

  return { collapsed, animating, toggle };
}
