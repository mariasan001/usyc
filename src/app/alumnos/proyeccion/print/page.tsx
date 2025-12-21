'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import s from './ProyeccionPrintPage.module.css';

type ProjectionRow = {
  idx: number;
  periodo: string;
  dueDate: string;
  conceptCode: string;
  amount: number;
  estado?: string;
  isPaid?: boolean;
  reciboId?: number;
};

type Totals = {
  totalPlan: number;
  totalPagado: number;
  saldo: number;

  totalInscripcion?: number;
  pagados: number;
  pendientes: number;
  vencidos: number;
};

type ProjectionPrintPayload = {
  alumnoId: string;
  alumnoNombre: string;
  matricula: string;
  generadoISO: string;
  rows: ProjectionRow[];
  totals?: Totals; // 👈 OJO: lo dejamos opcional por si el cache viejo no lo trae
};

const DEFAULT_TOTALS: Totals = {
  totalPlan: 0,
  totalPagado: 0,
  saldo: 0,
  totalInscripcion: 0,
  pagados: 0,
  pendientes: 0,
  vencidos: 0,
};

function parseAlumnoId(sp: URLSearchParams): string | null {
  const v = sp.get('alumnoId');
  if (!v) return null;
  const t = v.trim();
  return t ? t : null;
}

function readProjectionFromSession(alumnoId: string): ProjectionPrintPayload | null {
  try {
    const raw = sessionStorage.getItem(`projection:${alumnoId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ProjectionPrintPayload;
  } catch {
    return null;
  }
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    Number.isFinite(n) ? n : 0,
  );
}

function fmtDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-MX');
  } catch {
    return iso;
  }
}

export default function ProyeccionPrintPage() {
  const sp = useSearchParams();
  const alumnoId = useMemo(() => parseAlumnoId(sp), [sp]);

  const [data, setData] = useState<ProjectionPrintPayload | null>(null);
  const [err, setErr] = useState<string>('');

  const didAutoPrint = useRef(false);

  useEffect(() => {
    setErr('');
    setData(null);

    if (!alumnoId) {
      setErr('Falta alumnoId en la URL.');
      return;
    }

    const payload = readProjectionFromSession(alumnoId);

    if (!payload) {
      setErr(
        `No se encontró projection:${alumnoId} en sessionStorage. Regresa al drawer y da click en “Exportar PDF” desde Proyección.`,
      );
      return;
    }

    // ✅ normalizamos por si viene incompleto
    setData({
      ...payload,
      rows: Array.isArray(payload.rows) ? payload.rows : [],
      totals: payload.totals ?? DEFAULT_TOTALS,
    });
  }, [alumnoId]);

  useEffect(() => {
    if (!data) return;
    if (didAutoPrint.current) return;

    didAutoPrint.current = true;
    const t = setTimeout(() => window.print(), 450);
    return () => clearTimeout(t);
  }, [data]);

  if (err) {
    return (
      <div className={s.wrap}>
        <div className={s.card}>
          <div className={s.title}>No se pudo generar el PDF</div>
          <div className={s.msg}>{err}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={s.wrap}>
        <div className={s.card}>
          <div className={s.title}>Cargando…</div>
          <div className={s.msg}>Preparando reporte.</div>
        </div>
      </div>
    );
  }

  const rows = data.rows ?? [];
  const totals = data.totals ?? DEFAULT_TOTALS;

  return (
    <div className={s.page}>
      <div className={s.sheet}>
        <header className={s.header}>
          <div className={s.hLeft}>
            <div className={s.hTitle}>REPORTE DE PROYECCIÓN</div>
            <div className={s.hSub}>Generado: {fmtDateTime(data.generadoISO)}</div>
          </div>

          <div className={s.hRight}>
            <div className={s.pill}>Alumno: {data.alumnoNombre}</div>
            <div className={s.pill}>Matrícula: {data.matricula}</div>
            <div className={s.pill}>ID: {data.alumnoId}</div>
          </div>
        </header>

        <section className={s.summary}>
          <div className={s.sumCard}>
            <div className={s.sumLabel}>Total del plan</div>
            <div className={s.sumValue}>{fmtMoney(totals.totalPlan)}</div>
          </div>

          <div className={s.sumCard}>
            <div className={s.sumLabel}>Total pagado</div>
            <div className={s.sumValue}>{fmtMoney(totals.totalPagado)}</div>
          </div>

          <div className={s.sumCard}>
            <div className={s.sumLabel}>Saldo</div>
            <div className={s.sumValue}>{fmtMoney(totals.saldo)}</div>
          </div>

          <div className={s.sumCard}>
            <div className={s.sumLabel}>Pagados / Pendientes</div>
            <div className={s.sumValue}>
              {totals.pagados} / {totals.pendientes}
            </div>
          </div>
        </section>

        <section className={s.table}>
          <div className={s.trHead}>
            <div>#</div>
            <div>Periodo</div>
            <div>Vence</div>
            <div>Concepto</div>
            <div className={s.right}>Monto</div>
            <div>Estado</div>
          </div>

          {rows.map((r) => {
            const paid = !!r.isPaid;
            return (
              <div className={s.tr} key={`${r.periodo}_${r.idx}`}>
                <div>{r.idx}</div>
                <div className={s.mono}>{r.periodo}</div>
                <div className={s.mono}>{r.dueDate}</div>
                <div>{r.conceptCode}</div>
                <div className={`${s.mono} ${s.right}`}>{fmtMoney(r.amount)}</div>
                <div className={paid ? s.paid : s.pending}>
                  {paid ? 'PAGADO' : String(r.estado ?? 'PENDIENTE').toUpperCase()}
                </div>
              </div>
            );
          })}

          {rows.length === 0 ? <div className={s.empty}>Sin proyección para mostrar.</div> : null}
        </section>

        <footer className={s.footer}>
          <div>Control escolar</div>
          <div>Reporte interno • Proyección</div>
        </footer>
      </div>
    </div>
  );
}
