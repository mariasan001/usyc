'use client';

import { useEffect, useMemo, useState } from 'react';
import { DollarSign, Percent, User } from 'lucide-react';

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

const DURATIONS = [
  { label: '6 Meses', value: 6 },
  { label: '1 Año (12 meses)', value: 12 },
  { label: '2 Años (24 meses)', value: 24 },
  { label: '3 Años (36 meses)', value: 36 },
  { label: '4 Años (48 meses)', value: 48 },
] as const;

export default function StudentLedgerModal({
  open,
  onClose,
  student,
  allReceipts,
  onPayMonth, // opcional: si luego quieres “Pagar” que rellene el ReceiptForm
}: {
  open: boolean;
  onClose: () => void;
  student: StudentRef | null;
  allReceipts: Receipt[];
  onPayMonth?: (payload: { student: StudentRef; concepto: string; monto: number; fechaSugerida: string }) => void;
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

  // cargar config guardada por alumno al abrir
  useEffect(() => {
    if (!open || !student) return;
    const loaded = loadStudentPlan(studentKey, fallbackCfg);
    setCfg(loaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, studentKey]);

  // guardar config al cambiar (cuando el modal está abierto)
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

    // fecha sugerida: primer día del mes del row
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

    // fallback (sin wiring): solo abre recibos (si luego quieres leer query params, lo armamos)
    window.open('/recibos', '_blank', 'noopener,noreferrer');
  }

  return (
    <Modal open={open} onClose={onClose} title="">
      {!student ? null : (
        <div className={s.modalBody}>
          {/* Header azul */}
          <div className={s.header}>
            <div className={s.headerLeft}>
              <div className={s.studentName}>{student.nombre.toUpperCase()}</div>
            </div>

            <div className={s.headerRight}>
              <div className={s.pill}>
                <User size={14} />
                <span>{student.matricula ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={s.stats}>
            <div className={s.stat}>
              <div className={s.statValueRed}>{fmtMoney(summary.deuda)}</div>
              <div className={s.statLabel}>Deuda Acumulada</div>
            </div>

            <div className={s.divider} />

            <div className={s.stat}>
              <div className={s.statValueGreen}>{fmtMoney(summary.totalPagado)}</div>
              <div className={s.statLabel}>Total Pagado</div>
            </div>

            <div className={s.divider} />

            <div className={s.stat}>
              <div className={s.statValueDark}>{summary.progreso}%</div>
              <div className={s.statLabel}>Progreso de Pagos</div>
            </div>
          </div>

          <div className={s.meta}>
            <span><DollarSign size={14} /> Mensualidad: <b>{fmtMoney(cfg.monthlyAmount)}</b></span>
            <span><Percent size={14} /> Duración: <b>{cfg.durationMonths} meses</b></span>
            <span>Fin estimado: <b>{endLabel}</b></span>
          </div>

          <h3 className={s.h3}>Desglose de Mensualidades</h3>
          <p className={s.hint}>Generado automáticamente según la fecha de inicio y duración configurada.</p>

          <Table>
            <thead>
              <tr>
                <th>Periodo / Mes</th>
                <th>Concepto</th>
                <th>Monto Esperado</th>
                <th>Estado</th>
                <th>Fecha Pago</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {planRows.map((row) => (
                <tr key={row.key} className={row.estado === 'PAGADO' ? s.paidRow : undefined}>
                  <td>{row.periodoLabel}</td>
                  <td>{row.concepto}</td>
                  <td className={s.mono}>{fmtMoney(row.montoEsperado)}</td>
                  <td>
                    {row.estado === 'PAGADO' ? (
                      <span className={s.badgePaid}>PAGADO</span>
                    ) : (
                      <span className={s.badgePending}>PENDIENTE</span>
                    )}
                  </td>
                  <td className={s.mono}>{row.fechaPago ?? '-'}</td>
                  <td>
                    {row.estado === 'PAGADO' ? (
                      <span className={s.done}>✓ Listo</span>
                    ) : (
                      <Button onClick={() => payRow(row.key)} leftIcon={<DollarSign size={16} />}>
                        Pagar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Configuración */}
          <div className={s.config}>
            <div className={s.configLabel}>Duración de la Carrera</div>

            <div className={s.configRow}>
              <select
                className={s.select}
                value={cfg.durationMonths}
                onChange={(e) => setCfg({ ...cfg, durationMonths: Number(e.target.value) })}
              >
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>

              <input
                className={s.input}
                type="date"
                value={cfg.startDate}
                onChange={(e) => setCfg({ ...cfg, startDate: e.target.value })}
                title="Inicio del periodo"
              />

              <input
                className={s.input}
                type="number"
                min={0}
                value={cfg.monthlyAmount}
                onChange={(e) => setCfg({ ...cfg, monthlyAmount: Number(e.target.value || 0) })}
                title="Monto mensual esperado"
                placeholder="Monto mensual"
              />
            </div>

            <div className={s.configNote}>
              Tip: esto queda guardado por alumno (local) y se usa para calcular progreso y deuda.
            </div>
          </div>

          <div className={s.footerActions}>
            <Badge tone="info">Proyección automática</Badge>
            <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
