'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
  totals?: Totals;
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

function safeUpper(v?: string) {
  const t = (v ?? '').toString().trim();
  return t ? t.toUpperCase() : 'PENDIENTE';
}

export default function ProyeccionPrintClient() {
  const router = useRouter();
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

  function onPrint() {
    window.print();
  }

  function onBack() {
    router.back();
  }

  if (err) {
    return (
      <div className={s.wrap}>
        <div className={s.card}>
          <div className={s.title}>No se pudo generar el PDF</div>
          <div className={s.msg}>{err}</div>

          <div className={s.actions}>
            <button className={s.btn} onClick={onBack}>
              Volver
            </button>
          </div>
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
      <div className={s.actionBar}>
        <button className={s.actionBtn} onClick={onBack}>
          ← Volver
        </button>

        <div className={s.actionMeta}>
          <span className={s.metaChip}>USYC • Control de Recibos</span>
        </div>

        <button className={s.actionBtnPrimary} onClick={onPrint}>
          Imprimir
        </button>
      </div>

      <div className={s.sheet}>
        <header className={s.header}>
          <div className={s.headerCenter}>
            <div className={s.headerTitle}>REPORTE DE PROYECCIÓN</div>
            <div className={s.headerSub}>Generado: {fmtDateTime(data.generadoISO)}</div>
          </div>

          <div className={s.headerRight}>
            <div className={s.headerRightTitle}>CONTROL ESCOLAR</div>
            <div className={s.headerRightRow}>
              <span className={s.headerRightLabel}>ALUMNO:</span>
              <span className={s.headerRightValue}>{data.alumnoNombre}</span>
            </div>
          </div>
        </header>

        <div className={s.divider} />

        <section className={s.infoStrip}>
          <div className={s.infoPill}>
            <span className={s.infoK}>MATRÍCULA</span>
            <span className={s.infoV}>{data.matricula}</span>
          </div>

          <div className={s.infoPill}>
            <span className={s.infoK}>ID</span>
            <span className={s.infoV}>{data.alumnoId}</span>
          </div>
        </section>

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
        </section>

        <section className={s.tableCard}>
          <div className={s.tableTitle}>Detalle de pagos / periodos</div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.thSmall}>#</th>
                  <th>Periodo</th>
                  <th>Vence</th>
                  <th>Concepto</th>
                  <th className={s.tRight}>Monto</th>
                  <th>Estatus</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => {
                  const paid = !!r.isPaid;
                  const statusLabel = paid ? 'PAGADO' : safeUpper(r.estado);

                  return (
                    <tr key={`${r.periodo}_${r.idx}`}>
                      <td className={`${s.mono} ${s.tCenter}`}>{r.idx}</td>
                      <td className={s.mono}>{r.periodo}</td>
                      <td className={s.mono}>{r.dueDate}</td>
                      <td className={s.ellipsis}>{r.conceptCode}</td>
                      <td className={`${s.mono} ${s.tRight}`}>{fmtMoney(r.amount)}</td>
                      <td>
                        <span className={s.pill} data-status={statusLabel}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={s.empty}>
                      Sin proyección para mostrar.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <footer className={s.footer}>
          <div className={s.footerLeft}>Control escolar</div>
          <div className={s.footerRight}>Reporte interno • Proyección</div>
        </footer>
      </div>
    </div>
  );
}
