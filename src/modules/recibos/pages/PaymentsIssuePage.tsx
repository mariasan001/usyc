'use client';

import { useEffect, useMemo, useState } from 'react';
import { Printer, Send } from 'lucide-react';

import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';
import Button from '@/shared/ui/Button/Button';
import Input from '@/shared/ui/Input/Input';
import Table from '@/shared/ui/Table/Table';

import s from './PaymentsIssuePage.module.css';

import { loadStudentPlan } from '@/modules/receipts/utils/student-ledger.storage';
import type { Receipt } from '@/modules/receipts/types/receipt.types';
import {
  applyReceiptsToPlan,
  buildPlan,
  inferMonthlyAmount,
  inferStartDate,
  type PlanConfig,
  type StudentRef,
} from '@/modules/receipts/utils/student-ledger.utils';

/** =========================
 *  Helpers (periodo / folio)
 *  ========================= */
function yyyymm(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
}

function nextMonthKey() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return yyyymm(d);
}

function monthLabelFromKey(key: string) {
  const [y, m] = key.split('-').map((x) => Number(x));
  const d = new Date(y, (m || 1) - 1, 1);
  return d
    .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    .toUpperCase();
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function makeFolio(periodoKey: string, n: number) {
  // FOL-202601-0007
  const compact = periodoKey.replace('-', '');
  return `FOL-${compact}-${String(n).padStart(4, '0')}`;
}

function normalizeKey(str: string) {
  return (str ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

/** =========================
 *  Storage local de emisión
 *  ========================= */
type IssuedItem = {
  id: string; // `${studentKey}__${periodoKey}`
  studentKey: string;
  periodoKey: string; // YYYY-MM
  folio: string;
  fechaEmision: string; // YYYY-MM-DD
  concepto: string;
  monto: number;
};

const ISSUED_KEY = 'payments:issued:v1';

function loadIssued(): IssuedItem[] {
  try {
    const raw = localStorage.getItem(ISSUED_KEY);
    const parsed = raw ? (JSON.parse(raw) as IssuedItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveIssued(items: IssuedItem[]) {
  localStorage.setItem(ISSUED_KEY, JSON.stringify(items));
}

/** =========================
 *  Types UI
 *  ========================= */
type IssueRow = {
  id: string; // `${studentKey}__${periodoKey}`
  studentKey: string;

  alumno: string;
  matricula?: string | null;
  carrera?: string | null;

  periodoKey: string;
  periodoLabel: string;

  concepto: string; // Colegiatura
  monto: number;

  estado: 'SIN_EMISION' | 'EMITIDO' | 'PAGADO';
  folio?: string;
  fechaEmision?: string;
};

export default function PaymentsIssuePage() {
  const periodoKey = useMemo(() => nextMonthKey(), []);
  const periodoLabel = useMemo(() => monthLabelFromKey(periodoKey), [periodoKey]);

  // ⚠️ Sustituye por tus hooks reales (API)
  const [allReceipts] = useState<Receipt[]>([]);
  const [students] = useState<StudentRef[]>([]);

  const [issued, setIssued] = useState<IssuedItem[]>([]);
  useEffect(() => {
    setIssued(loadIssued());
  }, []);

  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [issuing, setIssuing] = useState(false);
  const [printing, setPrinting] = useState(false);

  const receiptsByStudent = useMemo(() => {
    const map = new Map<string, Receipt[]>();
    for (const r of allReceipts ?? []) {
      const k = (r.alumno?.matricula || r.alumno?.nombre || '').trim().toLowerCase();
      if (!k) continue;
      const arr = map.get(k) ?? [];
      arr.push(r);
      map.set(k, arr);
    }
    return map;
  }, [allReceipts]);

  const rows = useMemo<IssueRow[]>(() => {
    const out: IssueRow[] = [];

    for (const st of students ?? []) {
      const studentKey = (st.matricula || st.nombre).trim();
      if (!studentKey) continue;

      const receipts = receiptsByStudent.get(studentKey.toLowerCase()) ?? [];
      const fallbackCfg: PlanConfig = {
        startDate: inferStartDate(receipts),
        durationMonths: 6,
        monthlyAmount: inferMonthlyAmount(receipts, 0),
      };

      const cfg = loadStudentPlan(studentKey, fallbackCfg);
      const plan = applyReceiptsToPlan(buildPlan(cfg), receipts);

      const planRow = plan.find((x) => x.key === periodoKey);
      if (!planRow) continue;

      const isPaid = planRow.estado === 'PAGADO';

      const issuedItem = issued.find(
        (it) => it.studentKey === studentKey && it.periodoKey === periodoKey
      );

      const estado: IssueRow['estado'] = isPaid
        ? 'PAGADO'
        : issuedItem
          ? 'EMITIDO'
          : 'SIN_EMISION';

      out.push({
        id: `${studentKey}__${periodoKey}`,
        studentKey,
        alumno: st.nombre,
        matricula: st.matricula ?? null,
        carrera: (st as any).carrera ?? null,

        periodoKey,
        periodoLabel: planRow.periodoLabel ?? periodoLabel,

        concepto: planRow.concepto ?? 'Colegiatura',
        monto: planRow.montoEsperado ?? cfg.monthlyAmount,

        estado,
        folio: issuedItem?.folio,
        fechaEmision: issuedItem?.fechaEmision,
      });
    }

    return out;
  }, [students, receiptsByStudent, issued, periodoKey, periodoLabel]);

  const filtered = useMemo(() => {
    const needle = normalizeKey(q);
    if (!needle) return rows;

    return rows.filter((r) => {
      const hay = normalizeKey(
        `${r.alumno} ${r.matricula ?? ''} ${r.carrera ?? ''} ${r.periodoKey} ${r.concepto} ${r.folio ?? ''}`
      );
      return hay.includes(needle);
    });
  }, [rows, q]);

  const canIssue = useMemo(() => {
    if (selected.length === 0) return false;
    const selRows = filtered.filter((r) => selected.includes(r.id));
    return selRows.some((r) => r.estado === 'SIN_EMISION');
  }, [selected, filtered]);

  const canPrint = useMemo(() => {
    if (selected.length === 0) return false;
    const selRows = filtered.filter((r) => selected.includes(r.id));
    return selRows.some((r) => r.estado === 'EMITIDO');
  }, [selected, filtered]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAllVisible() {
    setSelected(filtered.filter((r) => r.estado !== 'PAGADO').map((x) => x.id));
  }

  function issueSelected() {
    const sel = filtered.filter((r) => selected.includes(r.id));
    const toIssue = sel.filter((r) => r.estado === 'SIN_EMISION');
    if (toIssue.length === 0) return;

    setIssuing(true);
    try {
      const already = issued.filter((x) => x.periodoKey === periodoKey).length;
      let counter = already;

      const created: IssuedItem[] = toIssue.map((r) => {
        counter += 1;
        return {
          id: `${r.studentKey}__${periodoKey}`,
          studentKey: r.studentKey,
          periodoKey,
          folio: makeFolio(periodoKey, counter),
          fechaEmision: todayISO(),
          concepto: r.concepto,
          monto: r.monto,
        };
      });

      const next = [...issued, ...created];
      setIssued(next);
      saveIssued(next);
    } finally {
      setIssuing(false);
    }
  }

  function printSelected() {
    // Solo imprime los emitidos
    const ids = filtered
      .filter((r) => selected.includes(r.id) && r.estado === 'EMITIDO')
      .map((r) => r.id);

    if (ids.length === 0) return;

    setPrinting(true);
    try {
      // Aquí conectas tu endpoint:
      // POST /api/payments/print { ids }
      console.log('PRINT', ids);
    } finally {
      setPrinting(false);
    }
  }

  function printOne(id: string) {
    // POST /api/payments/print { ids:[id] }
    console.log('PRINT ONE', id);
  }

  return (
    <Card
      title="Emisión de comprobantes"
      subtitle={`Genera folios del periodo: ${periodoLabel}. Selecciona uno o varios y emite.`}
      right={
        <div className={s.headerActions}>
          <Badge tone="info">{selected.length} seleccionados</Badge>

          <Button disabled={!canIssue} onClick={issueSelected} loading={issuing} leftIcon={<Send size={16} />}>
            Emitir
          </Button>

          <Button
            variant="secondary"
            disabled={!canPrint}
            onClick={printSelected}
            loading={printing}
            leftIcon={<Printer size={16} />}
          >
            Imprimir
          </Button>
        </div>
      }
      className={s.card}
    >
      <div className={s.wrap}>
        <div className={s.toolbar}>
          <div className={s.search}>
            <Input
              label=""
              placeholder="Buscar alumno, matrícula, carrera, folio o concepto…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <Button variant="secondary" onClick={selectAllVisible}>
            Seleccionar visibles
          </Button>
        </div>

        <div className={s.tableShell}>
          <Table>
            <thead>
              <tr>
                <th className={s.thCheck}>✓</th>
                <th className={s.colFolio}>Folio</th>
                <th className={s.colAlumno}>Alumno</th>
                <th className={s.colMatricula}>Matrícula</th>
                <th className={s.colCarrera}>Carrera</th>
                <th className={s.colPeriodo}>Periodo</th>
                <th className={s.colConcepto}>Concepto</th>
                <th className={s.colMonto}>Monto</th>
                <th className={s.colEstatus}>Estatus</th>
                <th className={s.colAccion}>Acción</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className={s.muted}>
                    No hay alumnos para emitir en este periodo (o tu filtro está muy ninja).
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const checked = selected.includes(r.id);
                  const disabled = r.estado === 'PAGADO';

                  return (
                    <tr
                      key={r.id}
                      className={
                        r.estado === 'EMITIDO' ? s.rowIssued : r.estado === 'PAGADO' ? s.rowPaid : undefined
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggle(r.id)}
                          title={disabled ? 'Ya está pagado' : 'Seleccionar'}
                        />
                      </td>

                      <td className={s.mono}>{r.folio ?? '—'}</td>
                      <td className={s.ellipsis} title={r.alumno}>{r.alumno}</td>
                      <td className={s.mono}>{r.matricula ?? '—'}</td>
                      <td className={s.ellipsis} title={r.carrera ?? ''}>{r.carrera ?? '—'}</td>
                      <td className={s.ellipsis} title={r.periodoLabel}>{r.periodoLabel}</td>
                      <td className={s.ellipsis} title={r.concepto}>{r.concepto}</td>
                      <td className={s.mono}>{fmtMoney(r.monto)}</td>

                      <td>
                        {r.estado === 'SIN_EMISION' ? (
                          <span className={s.badgePending}>Sin emisión</span>
                        ) : r.estado === 'EMITIDO' ? (
                          <span className={s.badgeIssued}>Emitido</span>
                        ) : (
                          <span className={s.badgePaid}>Pagado</span>
                        )}
                      </td>

                      <td className={s.actionsCell}>
                        <Button
                          variant="secondary"
                          leftIcon={<Printer size={16} />}
                          disabled={r.estado !== 'EMITIDO'}
                          onClick={() => printOne(r.id)}
                        >
                          Imprimir
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        <div className={s.footer}>
          <span>
            Total: <b>{rows.length}</b> • Filtrados: <b>{filtered.length}</b> • Seleccionados: <b>{selected.length}</b>
          </span>
        </div>
      </div>
    </Card>
  );
}
