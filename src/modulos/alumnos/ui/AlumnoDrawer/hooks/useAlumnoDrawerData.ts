'use client';

import { useMemo, useState } from 'react';
import type { Alumno } from '../../../types/alumno.types';


import type {
  DrawerTab,
  ProjectionRow,
  PagoRealRow,
  Totals,
} from '../types/alumno-drawer.types';

import { useAlumnoPagosResumen } from './useAlumnoPagosResumen';
import { AlumnoPagosResumenDTO } from '../types/alumno-pagos-resumen.types';

/* ─────────────────────────────────────────
  Helpers (luego los movemos a utils/dates.ts)
───────────────────────────────────────── */
function cmpISO(a: string, b: string) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function todayISO() {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function periodoFromISO(iso: string) {
  // "2025-12-20" -> "2025-12"
  return (iso ?? '').slice(0, 7);
}

type Args = { alumno: Alumno };

export function useAlumnoDrawerData({ alumno }: Args) {
  const [tab, setTab] = useState<DrawerTab>('RESUMEN');

  const alumnoId = alumno.alumnoId;

  // ✅ Tipado explícito (para que no se cuelen types raros)
  const {
    data,
    loading,
    error,
    reload,
  }: {
    data: AlumnoPagosResumenDTO | null;
    loading: boolean;
    error: string | null;
    reload: () => void;
  } = useAlumnoPagosResumen(alumnoId);

  /* ─────────────────────────────────────────
    Identidad / catálogos
  ────────────────────────────────────────── */
  const nombreCompleto = alumno.nombreCompleto ?? '—';
  const matricula = alumno.matricula ?? '—';
  const activo = !!alumno.activo;

  const escNombre = alumno.escolaridadNombre ?? '—';
  const carNombre = data?.carreraNombre ?? alumno.carreraNombre ?? '—';
  const plaNombre = '—'; // pendiente cuando haya plantel

  /* ─────────────────────────────────────────
    Plan (preferimos lo que venga del endpoint resumen)
  ────────────────────────────────────────── */
  const ingresoISO = data?.fechaIngreso ?? alumno.fechaIngreso ?? '—';
  const terminoISO = data?.fechaTermino ?? alumno.fechaTermino ?? '—';
  const precioMensual = data?.montoMensual ?? 0;
  const montoInscripcion = data?.montoInscripcion ?? 0;

  /* ─────────────────────────────────────────
    Pagos reales -> UI
  ────────────────────────────────────────── */
  const pagosReales: PagoRealRow[] = useMemo(() => {
    const list = data?.pagosReales ?? [];

    return list
      .filter((p) => !p.cancelado) // ✅ endpoint dice que no vienen cancelados, pero igual blindamos
      .slice()
      .sort((a, b) => cmpISO(b.fechaPago, a.fechaPago))
      .map((p) => ({
        reciboId: p.reciboId,
        folio: p.folio,
        fechaPago: p.fechaPago,
        concepto: p.concepto,
        monto: p.monto,
        moneda: p.moneda,
        estatusNombre: p.estatusNombre,
        cancelado: p.cancelado,
        alumnoNombre: p.alumnoNombre,
      }));
  }, [data?.pagosReales]);

  /* ─────────────────────────────────────────
    Proyección -> UI + reciboId “colgado”
  ────────────────────────────────────────── */
  const projection: ProjectionRow[] = useMemo(() => {
    const list = data?.proyeccion ?? [];
    const pagosValidos = (data?.pagosReales ?? []).filter((p) => !p.cancelado);

    // Mapa: "YYYY-MM|CONCEPTO" -> reciboId
    const paidMap = new Map<string, number>();
    for (const p of pagosValidos) {
      const per = periodoFromISO(p.fechaPago);
      const concepto = String(p.concepto ?? '').toUpperCase();
      paidMap.set(`${per}|${concepto}`, p.reciboId);
    }

    return list.map((x, i) => {
      const estadoUpper = String(x.estado ?? '').toUpperCase();
      const conceptoUpper = String(x.conceptoCodigo ?? '').toUpperCase();

      const reciboId = paidMap.get(`${x.periodo}|${conceptoUpper}`);
      const isPaid = estadoUpper === 'PAGADO' || typeof reciboId === 'number';

      return {
        idx: i + 1,
        periodo: x.periodo,
        dueDate: x.fechaVencimiento,
        conceptCode: x.conceptoCodigo,
        amount: x.monto,
        estado: x.estado,
        isPaid,
        reciboId,
      };
    });
  }, [data?.proyeccion, data?.pagosReales]);

  /* ─────────────────────────────────────────
    Totales
  ────────────────────────────────────────── */
  const totals: Totals = useMemo(() => {
    const totalPlan = data?.totalProyectado ?? 0;
    const totalPagado = data?.totalPagado ?? 0;
    const saldo = data?.saldoPendiente ?? 0;

    const pagados = projection.filter((x) => x.isPaid).length;
    const pendientes = projection.length - pagados;

    const t = todayISO();
    const vencidos = projection.filter(
      (x) => !x.isPaid && cmpISO(x.dueDate, t) < 0,
    ).length;

    // ✅ nextDue garantizado por fecha (no depende del orden del backend)
    const nextDue =
      projection
        .filter((x) => !x.isPaid)
        .slice()
        .sort((a, b) => cmpISO(a.dueDate, b.dueDate))[0] ?? null;

    return {
      totalPlan,
      totalPagado,
      saldo,
      totalInscripcion: montoInscripcion,
      pagados,
      pendientes,
      vencidos,
      nextDue,
    };
  }, [data?.totalProyectado, data?.totalPagado, data?.saldoPendiente, projection, montoInscripcion]);

  return {
    // ui
    tab,
    setTab,

    // request state
    loading,
    error,
    reload,

    // identity
    alumnoId,
    nombreCompleto,
    matricula,
    activo,

    // plan
    ingresoISO,
    terminoISO,
    precioMensual,
    montoInscripcion,

    // catalogs
    escNombre,
    carNombre,
    plaNombre,

    // data
    projection,
    pagosReales,
    totals,
  };
}
