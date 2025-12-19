import type { Alumno, FinancieroResumen, ID, PagoItem, PagoMetodo, PagoTipo, ProyeccionItem } from '../types/alumnos.tipos';

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export function isoToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export function addMonthsISO(isoDate: string, months: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, (m - 1) + months, d);
  // normaliza si se “desborda” por días (ej: 31)
  const yy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  return `${yy}-${mm}-${dd}`;
}

export function getPeriodo(isoDate: string): string {
  const [y, m] = isoDate.split('-');
  return `${y}-${m}`;
}

export function uid(prefix: string): ID {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function generarProyeccionMensualidades(alumno: Alumno): ProyeccionItem[] {
  const items: ProyeccionItem[] = [];
  for (let i = 0; i < alumno.duracionMeses; i++) {
    const fecha = addMonthsISO(alumno.fechaIngreso, i);
    items.push({
      id: uid('px') as ID,
      tipo: 'MENSUALIDAD',
      concepto: 'Mensualidad',
      periodo: getPeriodo(fecha),
      fechaProgramada: fecha,
      monto: alumno.precioMensual,
    });
  }
  return items;
}

export function calcularEstatusProyeccion(item: ProyeccionItem, pagos: PagoItem[], hoyISO = isoToday()) {
  const pagado = pagos.some((p) => p.refProyeccionId === item.id);
  if (pagado) return 'PAGADO' as const;
  if (item.fechaProgramada < hoyISO) return 'VENCIDO' as const;
  return 'PENDIENTE' as const;
}

export function calcularResumenFinanciero(proyeccion: ProyeccionItem[], pagos: PagoItem[]): FinancieroResumen {
  const totalPlan = proyeccion.reduce((acc, x) => acc + x.monto, 0);
  const totalPagado = pagos.reduce((acc, x) => acc + x.monto, 0);

  let vencidos = 0;
  let pendientes = 0;
  let pagados = 0;

  const hoy = isoToday();

  const pendientesOrdenados = proyeccion
    .map((x) => ({ x, est: calcularEstatusProyeccion(x, pagos, hoy) }))
    .sort((a, b) => a.x.fechaProgramada.localeCompare(b.x.fechaProgramada));

  for (const it of pendientesOrdenados) {
    if (it.est === 'PAGADO') pagados += 1;
    else if (it.est === 'VENCIDO') vencidos += 1;
    else pendientes += 1;
  }

  const proximoPendiente = pendientesOrdenados.find((it) => it.est !== 'PAGADO')?.x;

  return {
    totalPlan,
    totalPagado,
    saldo: Math.max(0, totalPlan - totalPagado),
    vencidos,
    pendientes,
    pagados,
    proximoPendiente,
  };
}

export function crearPagoDesdeProyeccion(args: {
  item: ProyeccionItem;
  metodo: PagoMetodo;
  fechaPagoISO: string;
}): PagoItem {
  const nowIso = new Date().toISOString();
  return {
    id: uid('pay') as ID,
    refProyeccionId: args.item.id,
    tipo: args.item.tipo,
    concepto: args.item.concepto,
    periodo: args.item.periodo,
    monto: args.item.monto,
    metodo: args.metodo,
    fechaPago: args.fechaPagoISO,
    creadoEn: nowIso,
  };
}

export function crearCargoExtra(args: {
  concepto: string;
  fechaProgramadaISO: string;
  monto: number;
}): ProyeccionItem {
  return {
    id: uid('extra') as ID,
    tipo: 'EXTRA',
    concepto: args.concepto,
    fechaProgramada: args.fechaProgramadaISO,
    monto: args.monto,
  };
}

export function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}
