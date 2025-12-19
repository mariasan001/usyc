// src/layout/Sidebar/hooks/useSidebarColapso.ts

import { useEffect, useLayoutEffect, useState } from 'react';
import { STORAGE_KEY_SIDEBAR } from '../constants/navegacion.constants';

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useSidebarColapso() {
  const [collapsed, setCollapsed] = useState(false);
  const [animating, setAnimating] = useState(false);

  useIsoLayoutEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SIDEBAR) === '1';
      setCollapsed(saved);
      document.documentElement.dataset.sidebarCollapsed = saved ? '1' : '0';
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SIDEBAR, collapsed ? '1' : '0');
    } catch {}
  }, [collapsed]);

  function toggle() {
    const next = !collapsed;
    document.documentElement.dataset.sidebarCollapsed = next ? '1' : '0';

    setAnimating(true);
    setCollapsed(next);
    window.setTimeout(() => setAnimating(false), 260);
  }

  return { collapsed, animating, toggle };
}
