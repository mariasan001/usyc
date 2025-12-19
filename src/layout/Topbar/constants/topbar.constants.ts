// src/layout/Topbar/constants/topbar.constants.ts
export type TopbarMeta = {
  title: string;
  subtitle?: string;
  placeholder?: string;
};

export type RutaMeta = {
  match: (pathname: string) => boolean;
  meta: TopbarMeta;
};

export const RUTAS_TOPBAR: RutaMeta[] = [
  {
    match: (p) => p === '/panel' || p === '/',
    meta: {
      title: 'Inicio',
      subtitle: 'Resumen general y accesos rápidos',
      placeholder: 'Buscar…',
    },
  },
  {
    match: (p) => p.startsWith('/alumnos'),
    meta: {
      title: 'Alumnos',
      subtitle: 'Altas, búsqueda y seguimiento por alumno',
      placeholder: 'Buscar alumno por nombre o matrícula…',
    },
  },
  {
    match: (p) => p.startsWith('/recibos'),
    meta: {
      title: 'Pagos y recibos',
      subtitle: 'Consulta, emite y administra comprobantes',
      placeholder: 'Buscar por folio, alumno o concepto…',
    },
  },
  {
    match: (p) => p.startsWith('/verificar'),
    meta: {
      title: 'Verificar QR',
      subtitle: 'Valida comprobantes por QR o folio',
      placeholder: 'Buscar por folio o referencia…',
    },
  },
  {
    match: (p) => p.startsWith('/configuracion'),
    meta: {
      title: 'Configuración',
      subtitle: 'Preferencias, usuarios y parámetros del sistema',
      placeholder: 'Buscar ajuste o sección…',
    },
  },
];
