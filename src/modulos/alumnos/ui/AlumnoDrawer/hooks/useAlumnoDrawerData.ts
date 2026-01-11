'use client';

import { useMemo, useState } from 'react';
import type { Alumno } from '../../../types/alumno.types';

import type {
  DrawerTab,
  ProjectionRow,
  PagoRealRow,
  Totals,
} from '../types/alumno-drawer.types';

import type { AlumnoPagosResumenDTO } from '../types/alumno-pagos-resumen.types';

import { useAlumnoPagosResumen } from './useAlumnoPagosResumen';

/* ─────────────────────────────────────────
  Helpers
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
  return (iso ?? '').slice(0, 7);
}

/** ✅ Normaliza QR por inconsistencia del backend */
function normalizeQr(p: { qrPayload?: string; qrPayLoad?: string }): string {
  const a = (p.qrPayload ?? '').trim();
  if (a) return a;
  const b = (p.qrPayLoad ?? '').trim();
  return b;
}

type Args = { alumno: Alumno };

export function useAlumnoDrawerData({ alumno }: Args) {
  const [tab, setTab] = useState<DrawerTab>('RESUMEN');
  const alumnoId = alumno.alumnoId;

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
  const plaNombre = '—';

  /* ─────────────────────────────────────────
    Plan
  ────────────────────────────────────────── */
  const ingresoISO = data?.fechaIngreso ?? alumno.fechaIngreso ?? '—';
  const terminoISO = data?.fechaTermino ?? alumno.fechaTermino ?? '—';
  const precioMensual = data?.montoMensual ?? 0;
  const montoInscripcion = data?.montoInscripcion ?? 0;

  /* ─────────────────────────────────────────
    Pagos reales -> UI
    ✅ conceptos dinámicos (string)
  ────────────────────────────────────────── */
  const pagosReales: PagoRealRow[] = useMemo(() => {
    const list = data?.pagosReales ?? [];

    return list
      .slice()
      .sort((a, b) => cmpISO(b.fechaPago, a.fechaPago))
      .map((p) => ({
        reciboId: p.reciboId,
        folio: p.folio,

        fechaEmision: p.fechaEmision ?? p.fechaPago,
        fechaPago: p.fechaPago,

        alumnoId: p.alumnoId ?? alumnoId,
        alumnoNombre: p.alumnoNombre ?? nombreCompleto,

        // ✅ SIN union, SIN normalizar
        concepto: String(p.concepto),

        monto: p.monto,
        moneda: p.moneda,

        estatusCodigo:
          p.estatusCodigo ?? (p.cancelado ? 'CANCELADO' : 'PAGADO'),
        estatusNombre: p.estatusNombre,

        tipoPagoId: p.tipoPagoId ?? 0,
        tipoPagoCodigo: p.tipoPagoCodigo ?? '',
        tipoPagoNombre: p.tipoPagoNombre ?? '',

        cancelado: !!p.cancelado,

        qrPayload: normalizeQr(p),
        qrPayLoad: p.qrPayLoad,
      }));
  }, [data?.pagosReales, alumnoId, nombreCompleto]);

  /* ─────────────────────────────────────────
    Proyección -> UI
    ✅ conceptos dinámicos (string)
  ────────────────────────────────────────── */
  const projection: ProjectionRow[] = useMemo(() => {
    const list = data?.proyeccion ?? [];
    const pagosValidos = (data?.pagosReales ?? []).filter(
      (p) => !p.cancelado
    );

    const paidMap = new Map<string, number>();
    for (const p of pagosValidos) {
      const per = periodoFromISO(p.fechaPago);
      const concepto = String(p.concepto);
      paidMap.set(`${per}|${concepto}`, p.reciboId);
    }

    return list.map((x, i) => {
      const concepto = String(x.conceptoCodigo);
      const reciboId = paidMap.get(`${x.periodo}|${concepto}`);

      const estadoUpper = String(x.estado ?? '').toUpperCase();
      const isPaid = estadoUpper === 'PAGADO' || typeof reciboId === 'number';

      return {
        idx: i + 1,
        periodo: x.periodo,
        dueDate: x.fechaVencimiento,
        conceptCode: concepto,
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
      (x) => !x.isPaid && cmpISO(x.dueDate, t) < 0
    ).length;

    return {
      totalPlan,
      totalPagado,
      saldo,
      pagados,
      pendientes,
      vencidos,
    };
  }, [data?.totalProyectado, data?.totalPagado, data?.saldoPendiente, projection]);

  return {
    tab,
    setTab,

    loading,
    error,
    reload,

    alumnoId,
    nombreCompleto,
    matricula,
    activo,

    ingresoISO,
    terminoISO,
    precioMensual,
    montoInscripcion,

    escNombre,
    carNombre,
    plaNombre,

    projection,
    pagosReales,
    totals,
  };
}
