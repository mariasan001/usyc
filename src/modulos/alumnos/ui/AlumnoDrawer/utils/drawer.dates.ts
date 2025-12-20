// src/modulos/alumnos/ui/AlumnoDrawer/utils/date.utils.ts

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayISO() {
  return toISODate(new Date());
}

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

// suma meses a YYYY-MM-DD y normaliza overflow (31/feb)
export function addMonthsISO(iso: string, monthsToAdd: number) {
  const [y, m, d] = iso.split('-').map((x) => Number(x));
  const base = new Date(y, (m - 1) + monthsToAdd, d);

  const safe = new Date(
    base.getFullYear(),
    base.getMonth(),
    Math.min(d, daysInMonth(base.getFullYear(), base.getMonth())),
  );

  return toISODate(safe);
}

// YYYY-MM-DD lexicográfico funciona
export function cmpISO(a: string, b: string) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function uid(prefix = 'p') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
