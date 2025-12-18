'use client';

import { useEffect, useMemo, useState } from 'react';
import { DollarSign, User } from 'lucide-react';

import Modal from '@/shared/ui/Modal/Modal';
import Table from '@/shared/ui/Table/Table';
import Badge from '@/shared/ui/Badge/Badge';
import Button from '@/shared/ui/Button/Button';

import type { Receipt } from '../../types/receipt.types';
import type { StudentRef, PlanConfig } from '../../utils/student-ledger.utils';

import {
  applyReceiptsToPlan,
  buildPlan,
  calcEstimatedEndDate,
  calcLedgerSummary,
  inferMonthlyAmount,
  inferStartDate,
} from '../../utils/student-ledger.utils';

import { loadStudentPlan, saveStudentPlan } from '../../utils/student-ledger.storage';

import s from './StudentLedgerModal.module.css';

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function StudentLedgerModal({
  open,
  onClose,
  student,
  allReceipts,
  onPayMonth,
}: {
  open: boolean;
  onClose: () => void;
  student: StudentRef | null;
  allReceipts: Receipt[];
  onPayMonth?: (payload: {
    student: StudentRef;
    concepto: string;
    monto: number;
    fechaSugerida: string;
  }) => void;
}) {
  const studentKey = useMemo(() => {
    if (!student) return '';
    return (student.matricula || student.nombre).trim();
  }, [student]);

  const studentReceipts = useMemo(() => {
    if (!student) return [];
    const key = (student.matricula || student.nombre).trim().toLowerCase();

    return allReceipts.filter((r) => {
      const mk = (r.alumno.matricula || r.alumno.nombre).trim().toLowerCase();
      return mk === key;
    });
  }, [allReceipts, student]);

  const fallbackCfg = useMemo<PlanConfig>(() => {
    const startDate = inferStartDate(studentReceipts);
    const monthlyAmount = inferMonthlyAmount(studentReceipts, 0);
    return { startDate, durationMonths: 6, monthlyAmount };
  }, [studentReceipts]);

  const [cfg, setCfg] = useState<PlanConfig>(fallbackCfg);

  // cargar cfg al abrir
  useEffect(() => {
    if (!open || !student) return;
    const loaded = loadStudentPlan(studentKey, fallbackCfg);
    setCfg(loaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, studentKey]);

  // guardar cfg (sin UI de ajustes, pero sí persistencia)
  useEffect(() => {
    if (!open || !student) return;
    saveStudentPlan(studentKey, cfg);
  }, [cfg, open, student, studentKey]);

  const planRows = useMemo(() => {
    const base = buildPlan(cfg);
    return applyReceiptsToPlan(base, studentReceipts);
  }, [cfg, studentReceipts]);

  const summary = useMemo(() => calcLedgerSummary(planRows), [planRows]);
  const endLabel = useMemo(() => calcEstimatedEndDate(cfg), [cfg]);

  function payRow(rowKey: string) {
    const row = planRows.find((x) => x.key === rowKey);
    if (!row || !student) return;

    const fechaSugerida = `${row.key}-01`;

    if (onPayMonth) {
      onPayMonth({
        student,
        concepto: row.concepto,
        monto: row.montoEsperado,
        fechaSugerida,
      });
      onClose();
      return;
    }

    window.open('/recibos', '_blank', 'noopener,noreferrer');
  }

  return (
    <Modal open={open} onClose={onClose} title="">
      {!student ? null : (
        <div className={s.shell}>
          {/* Header */}
          <div className={s.header}>
            <div className={s.headerLeft}>
              <div className={s.kicker}>Detalle del alumno</div>
              <div className={s.titleRow}>
                <div className={s.studentName}>{student.nombre}</div>
                {student.matricula ? <span className={s.dot}>•</span> : null}
                <div className={s.studentMeta}>
                  {student.matricula ? `Matrícula: ${student.matricula}` : 'Sin matrícula'}
                </div>
              </div>
              <div className={s.sub}>
                Proyección y mensualidades calculadas con tu configuración guardada.
              </div>
            </div>

            <div className={s.headerRight}>
              <div className={s.pill}>
                <User size={14} />
                <span>{student.matricula ?? '—'}</span>
              </div>

            
            </div>
          </div>

          {/* Content scroll */}
          <div className={s.content}>
            {/* Stats */}
            <div className={s.stats}>
              <div className={s.statCard}>
                <div className={s.statLabel}>Deuda acumulada</div>
                <div className={s.statValueRed}>{fmtMoney(summary.deuda)}</div>
              </div>

              <div className={s.statCard}>
                <div className={s.statLabel}>Total pagado</div>
                <div className={s.statValueGreen}>{fmtMoney(summary.totalPagado)}</div>
              </div>

              <div className={s.statCard}>
                <div className={s.statTop}>
                  <div className={s.statLabel}>Progreso</div>
                  <div className={s.statPct}>{summary.progreso}%</div>
                </div>

                <div className={s.progressTrack} aria-hidden="true">
                  <div
                    className={s.progressFill}
                    style={{ width: `${Math.max(0, Math.min(100, summary.progreso))}%` }}
                  />
                </div>

                <div className={s.progressHint}>Calculado con tu proyección guardada.</div>
              </div>
            </div>

            {/* Info bar */}
            <div className={s.infoBar}>
              <span className={s.infoItem}>
                <DollarSign size={14} />
                Mensualidad: <b>{fmtMoney(cfg.monthlyAmount)}</b>
              </span>

              <span className={s.sep}>•</span>

              <span className={s.infoItem}>
                Duración: <b>{cfg.durationMonths} meses</b>
              </span>

              <span className={s.sep}>•</span>

              <span className={s.infoItem}>
                Fin estimado: <b>{endLabel}</b>
              </span>
            </div>

            {/* Table */}
            <div className={s.sectionHead}>
              <div className={s.h3}>Desglose de mensualidades</div>
              <div className={s.hint}>Generado automáticamente según inicio y duración.</div>
            </div>

            <div className={s.tableShell}>
              <Table>
                <thead>
                  <tr>
                    <th className={s.thPeriodo}>Periodo</th>
                    <th className={s.thConcepto}>Concepto</th>
                    <th className={s.thMonto}>Monto</th>
                    <th className={s.thEstado}>Estado</th>
                    <th className={s.thFecha}>Fecha pago</th>
                    <th className={s.thAccion}>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {planRows.map((row) => (
                    <tr key={row.key} className={row.estado === 'PAGADO' ? s.paidRow : undefined}>
                      <td className={s.periodCell}>{row.periodoLabel}</td>
                      <td className={s.conceptCell}>{row.concepto}</td>
                      <td className={s.mono}>{fmtMoney(row.montoEsperado)}</td>
                      <td>
                        {row.estado === 'PAGADO' ? (
                          <span className={s.badgePaid}>Pagado</span>
                        ) : (
                          <span className={s.badgePending}>Pendiente</span>
                        )}
                      </td>
                      <td className={s.mono}>{row.fechaPago ?? '-'}</td>
                      <td className={s.actionCell}>
                        {row.estado === 'PAGADO' ? (
                          <span className={s.done}>✓ Listo</span>
                        ) : (
                          <button className={s.payBtn} onClick={() => payRow(row.key)} type="button">
                            <DollarSign size={16} />
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          {/* Footer */}
          <div className={s.footer}>
            <Badge tone="info">Proyección automática</Badge>
           
          </div>
        </div>
      )}
    </Modal>
  );
}
