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
 *  MOCKS (solo UI demo)
 *  ========================= */
type StudentMock = StudentRef & { carrera?: string; mensualidad: number };

const MOCK_STUDENTS: StudentMock[] = [
  { nombre: 'Diana Pérez', matricula: 'LEN-24-01', carrera: 'Enfermería', mensualidad: 330 },
  { nombre: 'Juan Pérez', matricula: 'LWD-2345', carrera: 'Sistemas', mensualidad: 450 },
  { nombre: 'María Sandoval', matricula: '13224', carrera: 'Derecho', mensualidad: 390 },
  { nombre: 'María López', matricula: 'A002', carrera: 'Psicología', mensualidad: 300 },
  { nombre: 'Pedro Ramírez', matricula: 'A003', carrera: 'Arquitectura', mensualidad: 520 },
  { nombre: 'Luis Hernández', matricula: 'A004', carrera: 'Contabilidad', mensualidad: 410 },
  { nombre: 'Ana Torres', matricula: 'A005', carrera: 'Nutrición', mensualidad: 380 },
  { nombre: 'Carlos Vega', matricula: 'A006', carrera: 'Administración', mensualidad: 360 },
  { nombre: 'Sofía García', matricula: 'A007', carrera: 'Criminología', mensualidad: 410 },
  { nombre: 'Diego Cruz', matricula: 'A008', carrera: 'Diseño', mensualidad: 340 },
];

// Algunos pagos reales (para que veas "PAGADO" en meses pasados/actual)
const MOCK_RECEIPTS: Receipt[] = [
  {
    id: 'r1',
    alumno: { nombre: 'Diana Pérez', matricula: 'LEN-24-01' },
    monto: 330,
    fechaPago: '2025-12-18',
    concepto: 'Colegiatura',
  } as any,
  {
    id: 'r2',
    alumno: { nombre: 'Juan Pérez', matricula: 'LWD-2345' },
    monto: 450,
    fechaPago: '2025-11-10',
    concepto: 'Colegiatura',
  } as any,
  {
    id: 'r3',
    alumno: { nombre: 'Juan Pérez', matricula: 'LWD-2345' },
    monto: 450,
    fechaPago: '2025-12-10',
    concepto: 'Colegiatura',
  } as any,
  {
    id: 'r4',
    alumno: { nombre: 'María López', matricula: 'A002' },
    monto: 300,
    fechaPago: '2025-12-05',
    concepto: 'Colegiatura',
  } as any,
];

/** =========================
 *  Helpers (periodo / folio)
 *  ========================= */
function yyyymm(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
}

function addMonthsKey(base: Date, delta: number) {
  const d = new Date(base);
  d.setDate(1);
  d.setMonth(d.getMonth() + delta);
  return yyyymm(d);
}

function monthLabelFromKey(key: string) {
  const [y, m] = key.split('-').map((x) => Number(x));
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase();
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function makeFolio(periodoKey: string, n: number) {
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
type EstadoUI = 'SIN_EMISION' | 'EMITIDO' | 'PAGADO' | 'ADEUDO';

type IssueRow = {
  id: string; // `${studentKey}__${periodoKey}`
  studentKey: string;

  alumno: string;
  matricula?: string | null;
  carrera?: string | null;

  periodoKey: string;
  periodoLabel: string;

  concepto: string;
  monto: number;

  estado: EstadoUI;
  folio?: string;
  fechaEmision?: string;
};

export default function PaymentsIssuePage() {
  const currentMonthKey = useMemo(() => yyyymm(new Date()), []);

  // ✅ Periodo filtrable: anterior / actual / próximo (default = próximo)
  const [periodoKey, setPeriodoKey] = useState<string>(() => addMonthsKey(new Date(), +1));
  const periodoLabel = useMemo(() => monthLabelFromKey(periodoKey), [periodoKey]);

  const periodOptions = useMemo(() => {
    const base = new Date();
    const prev = addMonthsKey(base, -1);
    const now = addMonthsKey(base, 0);
    const next = addMonthsKey(base, +1);

    return [
      { key: prev, label: `MES ANTERIOR • ${monthLabelFromKey(prev)}` },
      { key: now, label: `MES ACTUAL • ${monthLabelFromKey(now)}` },
      { key: next, label: `PRÓXIMO MES • ${monthLabelFromKey(next)}` },
    ];
  }, []);

  // ✅ DEMO
  const [allReceipts] = useState<Receipt[]>(MOCK_RECEIPTS);
  const [students] = useState<StudentMock[]>(MOCK_STUDENTS);

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

      const inferred = inferMonthlyAmount(receipts, 0);
      const fallbackCfg: PlanConfig = {
        startDate: inferStartDate(receipts),
        durationMonths: 6,
        monthlyAmount: inferred && inferred > 0 ? inferred : st.mensualidad,
      };

      const cfg = loadStudentPlan(studentKey, fallbackCfg);
      const monthly = cfg.monthlyAmount && cfg.monthlyAmount > 0 ? cfg.monthlyAmount : st.mensualidad;

      const plan = applyReceiptsToPlan(buildPlan({ ...cfg, monthlyAmount: monthly }), receipts);
      const planRow = plan.find((x) => x.key === periodoKey);

      const concepto = planRow?.concepto ?? 'Colegiatura';
      const monto = (planRow?.montoEsperado ?? monthly) || st.mensualidad;

      const isPaid = planRow?.estado === 'PAGADO';

      const issuedItem = issued.find((it) => it.studentKey === studentKey && it.periodoKey === periodoKey);

      const isPast = periodoKey < currentMonthKey;

      let estado: EstadoUI;
      if (isPaid) estado = 'PAGADO';
      else if (issuedItem) estado = 'EMITIDO';
      else if (isPast) estado = 'ADEUDO';
      else estado = 'SIN_EMISION';

      out.push({
        id: `${studentKey}__${periodoKey}`,
        studentKey,
        alumno: st.nombre,
        matricula: st.matricula ?? null,
        carrera: st.carrera ?? null,
        periodoKey,
        periodoLabel: planRow?.periodoLabel ?? periodoLabel,
        concepto,
        monto,
        estado,
        folio: issuedItem?.folio,
        fechaEmision: issuedItem?.fechaEmision,
      });
    }

    return out;
  }, [students, receiptsByStudent, issued, periodoKey, periodoLabel, currentMonthKey]);

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
    return selRows.some((r) => r.estado === 'EMITIDO' && r.folio);
  }, [selected, filtered]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAllVisible() {
    // Selecciona todo menos pagado
    setSelected(filtered.filter((r) => r.estado !== 'PAGADO').map((x) => x.id));
  }

  /** =========================
   *  ✅ CONEXIÓN A /recibos/print
   *  ========================= */
  function goPrintOneByFolio(folio?: string) {
    if (!folio) return;
    window.location.href = `/recibos/print?folio=${encodeURIComponent(folio)}`;
  }

  function goPrintBatchByFolios(folios: string[]) {
    const list = folios.filter(Boolean);
    if (list.length === 0) return;
    const qs = list.map((f) => f.trim()).join(',');
    window.location.href = `/recibos/print?folios=${encodeURIComponent(qs)}`;
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

      // refresca UI: seleccionados siguen igual, pero ahora ya tendrán folio/emitido
      // opcional: setSelected([]); // si quieres limpiar selección al emitir
    } finally {
      setIssuing(false);
    }
  }

  function printSelected() {
    // Solo imprime los EMITIDOS con folio
    setPrinting(true);
    try {
      const selRows = filtered.filter((r) => selected.includes(r.id));
      const folios = selRows
        .filter((r) => r.estado === 'EMITIDO' && r.folio)
        .map((r) => r.folio!) ;

      goPrintBatchByFolios(folios);
    } finally {
      setPrinting(false);
    }
  }

  function printOne(row: IssueRow) {
    if (row.estado !== 'EMITIDO') return;
    goPrintOneByFolio(row.folio);
  }

  return (
    <Card
      title="Emisión de comprobantes"
      subtitle={`Periodo seleccionado: ${periodoLabel}. Filtra por mes y emite folios.`}
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
          {/* Periodo */}
          <select
            className={s.select}
            value={periodoKey}
            onChange={(e) => {
              setPeriodoKey(e.target.value);
              setSelected([]);
            }}
            title="Periodo"
          >
            {periodOptions.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Buscar alumno/matrícula */}
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
                    No hay resultados para este periodo/filtro.
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
                        r.estado === 'EMITIDO'
                          ? s.rowIssued
                          : r.estado === 'PAGADO'
                            ? s.rowPaid
                            : r.estado === 'ADEUDO'
                              ? s.rowDebt
                              : undefined
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
                      <td className={s.ellipsis} title={r.alumno}>
                        {r.alumno}
                      </td>
                      <td className={s.mono}>{r.matricula ?? '—'}</td>
                      <td className={s.ellipsis} title={r.carrera ?? ''}>
                        {r.carrera ?? '—'}
                      </td>
                      <td className={s.ellipsis} title={r.periodoLabel}>
                        {r.periodoLabel}
                      </td>
                      <td className={s.ellipsis} title={r.concepto}>
                        {r.concepto}
                      </td>
                      <td className={s.mono}>{fmtMoney(r.monto)}</td>

                      <td>
                        {r.estado === 'SIN_EMISION' ? (
                          <span className={s.badgePending}>Sin emisión</span>
                        ) : r.estado === 'EMITIDO' ? (
                          <span className={s.badgeIssued}>Emitido</span>
                        ) : r.estado === 'ADEUDO' ? (
                          <span className={s.badgeDebt}>Adeudo</span>
                        ) : (
                          <span className={s.badgePaid}>Pagado</span>
                        )}
                      </td>

                      <td className={s.actionsCell}>
                        <Button
                          variant="secondary"
                          leftIcon={<Printer size={16} />}
                          disabled={r.estado !== 'EMITIDO'}
                          onClick={() => printOne(r)}
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
