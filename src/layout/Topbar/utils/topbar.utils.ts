// src/layout/Topbar/utils/topbar.utils.ts
import type { TopbarMeta } from '../constants/topbar.constants';
import { RUTAS_TOPBAR } from '../constants/topbar.constants';

const FALLBACK: TopbarMeta = {
  title: 'Panel',
  subtitle: 'Gestión del sistema',
  placeholder: 'Buscar…',
};

export function resolverMetaTopbar(pathname: string): TopbarMeta {
  const found = RUTAS_TOPBAR.find((r) => r.match(pathname));
  return found?.meta ?? FALLBACK;
}
