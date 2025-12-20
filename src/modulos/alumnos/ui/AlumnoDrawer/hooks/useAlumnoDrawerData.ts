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

type Args = {
  alumno: Alumno;
};

export function useAlumnoDrawerData({ alumno }: Args) {
  const [tab, setTab] = useState<DrawerTab>('RESUMEN');

  const alumnoId = alumno.alumnoId;
  const { data, loading, error, reload } = useAlumnoPagosResumen(alumnoId);

  // Identidad
  const nombreCompleto = alumno.nombreCompleto ?? '—';
  const matricula = alumno.matricula ?? '—';
  const activo = !!alumno.activo;

  // Plan (preferimos lo del endpoint pagos-resumen)
  const ingresoISO = data?.fechaIngreso ?? alumno.fechaIngreso ?? '—';
  const terminoISO = data?.fechaTermino ?? alumno.fechaTermino ?? '—';

  const precioMensual = data?.montoMensual ?? 0;
  const montoInscripcion = data?.montoInscripcion ?? 0;

  // Catálogos (del alumno básico)
  const escNombre = alumno.escolaridadNombre ?? '—';
  const carNombre = data?.carreraNombre ?? alumno.carreraNombre ?? '—';
  const plaNombre = '—'; // cuando llegue plantelNombre real, lo conectas

  // Pagos reales -> UI (esto lo usa PagosPanel)
  const pagosReales: PagoRealRow[] = useMemo(() => {
    const list = data?.pagosReales ?? [];
    return list
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
      }));
  }, [data]);

  // Proyección -> UI (esto es lo que habilita el botón de imprimir)
  const projection: ProjectionRow[] = useMemo(() => {
    const list = data?.proyeccion ?? [];

    // ✅ pagos válidos (no cancelados)
    const pagosValidos = (data?.pagosReales ?? []).filter((p) => !p.cancelado);

    // ✅ Mapa: "YYYY-MM|CONCEPTO" -> reciboId
    // Ej: "2025-12|INSCRIPCION" -> 2
    const paidMap = new Map<string, number>();
    for (const p of pagosValidos) {
      const per = periodoFromISO(p.fechaPago);
      const concepto = String(p.concepto ?? '').toUpperCase();
      const key = `${per}|${concepto}`;
      paidMap.set(key, p.reciboId);
    }

    return list.map((x, i) => {
      const estadoUpper = String(x.estado ?? '').toUpperCase();
      const conceptoUpper = String(x.conceptoCodigo ?? '').toUpperCase();

      // ✅ si el back dice pagado, lo respetamos
      const backPaid = estadoUpper === 'PAGADO';

      // ✅ colgar reciboId desde pagos reales (porque proyección no lo trae)
      const key = `${x.periodo}|${conceptoUpper}`;
      const reciboId = paidMap.get(key);

      // ✅ pagado si: back lo dice o encontramos reciboId
      const isPaid = backPaid || typeof reciboId === 'number';

      return {
        idx: i + 1,
        periodo: x.periodo,
        dueDate: x.fechaVencimiento,
        conceptCode: x.conceptoCodigo,
        amount: x.monto,
        estado: x.estado,
        isPaid,
        reciboId, // ✅ AHORA SÍ existe y se habilita imprimir
      };
    });
  }, [data]);

  // Totales
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

    const nextDue =
      projection.find((x) => !x.isPaid && cmpISO(x.dueDate, t) >= 0) ??
      projection.find((x) => !x.isPaid) ??
      null;

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
  }, [data, projection, montoInscripcion]);

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
