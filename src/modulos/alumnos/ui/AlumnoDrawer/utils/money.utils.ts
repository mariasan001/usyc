// src/modulos/alumnos/ui/AlumnoDrawer/utils/money.utils.ts

export function money(n: unknown) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

export function formatMXN(n: unknown) {
  const v = money(n);
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(v);
}
