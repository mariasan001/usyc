export const ROUTES = {
  home: '/',
  receipts: '/recibos',
  verify: '/verificar',
} as const;

export type RouteKey = keyof typeof ROUTES;
