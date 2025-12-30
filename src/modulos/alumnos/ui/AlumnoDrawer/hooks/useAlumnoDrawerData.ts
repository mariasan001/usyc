'use client';

import { useMemo, useState } from 'react';
import type { Alumno } from '../../../types/alumno.types';

import type { DrawerTab, ProjectionRow, PagoRealRow, Totals } from '../types/alumno-drawer.types';
import type { AlumnoPagosResumenDTO } from '../types/alumno-pagos-resumen.types';
import type { ReciboConcepto } from '../types/recibos.types';

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

/** ✅ Convierte string del back a union ReciboConcepto */
function toReciboConcepto(v: string): ReciboConcepto {
  const x = String(v ?? '').toUpperCase().trim();
  if (x === 'INSCRIPCION') return 'INSCRIPCION';
  if (x === 'MENSUALIDAD') return 'MENSUALIDAD';
  return 'OTRO';
}

/** ✅ Normaliza el QR (por inconsistencia qrPayload vs qrPayLoad) */
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
    Pagos reales -> UI (✅ ahora sí llena todo PagoRealRow)
  ────────────────────────────────────────── */
  const pagosReales: PagoRealRow[] = useMemo(() => {
    const list = data?.pagosReales ?? [];

    return list
      .slice()
      .sort((a, b) => cmpISO(b.fechaPago, a.fechaPago))
      .map((p) => ({
        reciboId: p.reciboId,
        folio: p.folio,

        // ✅ si el back no manda fechaEmision, usamos fechaPago como fallback
        fechaEmision: p.fechaEmision ?? p.fechaPago,
        fechaPago: p.fechaPago,

        // ✅ si el back no manda alumnoId aquí, usamos el del hook/alumno
        alumnoId: p.alumnoId ?? alumnoId,
        alumnoNombre: p.alumnoNombre ?? nombreCompleto,

        // ✅ tipado fuerte
        concepto: toReciboConcepto(String(p.concepto)),
        monto: p.monto,
        moneda: p.moneda,

        // ✅ si no viene estatusCodigo, armamos uno razonable
        estatusCodigo: p.estatusCodigo ?? (p.cancelado ? 'CANCELADO' : 'PAGADO'),
        estatusNombre: p.estatusNombre,

        // ✅ si no vienen tipoPago*, fallback
        tipoPagoId: p.tipoPagoId ?? 0,
        tipoPagoCodigo: p.tipoPagoCodigo ?? '',
        tipoPagoNombre: p.tipoPagoNombre ?? '',

        cancelado: !!p.cancelado,

        // ✅ normalizado
        qrPayload: normalizeQr(p),
        qrPayLoad: p.qrPayLoad,
      }));
  }, [data?.pagosReales, alumnoId, nombreCompleto]);

  /* ─────────────────────────────────────────
    Proyección -> UI + reciboId “colgado”
    (✅ conceptCode ahora es ReciboConcepto)
  ────────────────────────────────────────── */
  const projection: ProjectionRow[] = useMemo(() => {
    const list = data?.proyeccion ?? [];
    const pagosValidos = (data?.pagosReales ?? []).filter((p) => !p.cancelado);

    const paidMap = new Map<string, number>();
    for (const p of pagosValidos) {
      const per = periodoFromISO(p.fechaPago);
      const concepto = toReciboConcepto(String(p.concepto));
      paidMap.set(`${per}|${concepto}`, p.reciboId);
    }

    return list.map((x, i) => {
      const estadoUpper = String(x.estado ?? '').toUpperCase();
      const concept = toReciboConcepto(String(x.conceptoCodigo));

      const reciboId = paidMap.get(`${x.periodo}|${concept}`);
      const isPaid = estadoUpper === 'PAGADO' || typeof reciboId === 'number';

      return {
        idx: i + 1,
        periodo: x.periodo,
        dueDate: x.fechaVencimiento,
        conceptCode: concept, // ✅ ya no string
        amount: x.monto,
        estado: x.estado,
        isPaid,
        reciboId,
      };
    });
  }, [data?.proyeccion, data?.pagosReales]);

  /* ─────────────────────────────────────────
    Totales (deja solo lo que tu Totals define)
  ────────────────────────────────────────── */
  const totals: Totals = useMemo(() => {
    const totalPlan = data?.totalProyectado ?? 0;
    const totalPagado = data?.totalPagado ?? 0;
    const saldo = data?.saldoPendiente ?? 0;

    const pagados = projection.filter((x) => x.isPaid).length;
    const pendientes = projection.length - pagados;

    const t = todayISO();
    const vencidos = projection.filter((x) => !x.isPaid && cmpISO(x.dueDate, t) < 0).length;

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
