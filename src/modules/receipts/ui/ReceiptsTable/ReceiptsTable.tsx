'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, RefreshCcw } from 'lucide-react';

import Table from '@/shared/ui/Table/Table';
import Badge from '@/shared/ui/Badge/Badge';
import Button from '@/shared/ui/Button/Button';

import type { Receipt, StudentPlanDuration } from '../../types/receipt.types';
import s from './ReceiptsTable.module.css';

import StudentLedgerModal from '../StudentLedgerModal/StudentLedgerModal';
import type { StudentRef } from '../../utils/student-ledger.utils';

type UiQuery = {
  q: string;
  status: 'ALL' | 'CORRIENTE' | 'ADEUDO';
  dateFrom: string;
  dateTo: string;
};

// ✅ por si Receipt.alumno aún no trae plan
type ReceiptPlan = Receipt & {
  alumno: Receipt['alumno'] & {
    carrera?: string;
    duracionMeses?: StudentPlanDuration;
    fechaInicio?: string;
  };
};

type StudentRow = {
  key: string;
  nombre: string;
  matricula: string | null;

  carrera: string;
  duracionMeses: StudentPlanDuration;

  fechaIngreso: string;
  fechaTermino: string;

  ultimoPago: string;
  estado: 'CORRIENTE' | 'ADEUDO';
};

function normalizeKey(str: string) {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function addMonthsISO(iso: string, months: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, (m - 1) + months, d);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function inRange(iso: string, from: string, to: string) {
  if (from && iso < from) return false;
  if (to && iso > to) return false;
  return true;
}

// ✅ heurística: “corriente” si pagó en el mes actual
function isCorriente(ultimoPagoISO: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const ymNow = `${y}-${String(m).padStart(2, '0')}`;
  return ultimoPagoISO.slice(0, 7) === ymNow;
}

export default function ReceiptsTable({
  items,
  loading,
  error,
  query,
  setQuery,
  onRefresh,
}: {
  items: Receipt[];
  loading?: boolean;
  error?: string | null;
  query: UiQuery;
  setQuery: (q: UiQuery) => void;
  onRefresh: () => Promise<void>;
}) {
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledgerStudent, setLedgerStudent] = useState<StudentRef | null>(null);

  // ✅ paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ✅ agrupar recibos -> alumnos únicos
  const students = useMemo<StudentRow[]>(() => {
    const map = new Map<string, StudentRow>();

    for (const raw of items as ReceiptPlan[]) {
      const matricula = (raw.alumno.matricula ?? '').trim();
      const nombre = (raw.alumno.nombre ?? '').trim();

      const key = matricula ? `m:${matricula}` : `n:${normalizeKey(nombre)}`;

      const carrera = (raw.alumno.carrera ?? '').trim();
      const duracionMeses = (raw.alumno.duracionMeses ?? 6) as StudentPlanDuration;

      // ingreso: si viene fechaInicio úsala; si no, primer pago
      const ingreso = raw.alumno.fechaInicio ?? raw.fechaPago;

      const prev = map.get(key);

      if (!prev) {
        map.set(key, {
          key,
          nombre: nombre || '—',
          matricula: matricula || null,
          carrera: carrera || '—',
          duracionMeses,
          fechaIngreso: ingreso,
          fechaTermino: addMonthsISO(ingreso, duracionMeses),
          ultimoPago: raw.fechaPago,
          estado: isCorriente(raw.fechaPago) ? 'CORRIENTE' : 'ADEUDO',
        });
        continue;
      }

      const fechaIngreso = ingreso < prev.fechaIngreso ? ingreso : prev.fechaIngreso;
      const ultimoPago = raw.fechaPago > prev.ultimoPago ? raw.fechaPago : prev.ultimoPago;

      const finalDur = (prev.duracionMeses ?? duracionMeses) as StudentPlanDuration;
      const finalCarrera = prev.carrera !== '—' ? prev.carrera : (carrera || '—');

      map.set(key, {
        ...prev,
        nombre: prev.nombre !== '—' ? prev.nombre : (nombre || '—'),
        matricula: prev.matricula ?? (matricula || null),
        carrera: finalCarrera,
        duracionMeses: finalDur,
        fechaIngreso,
        fechaTermino: addMonthsISO(fechaIngreso, finalDur),
        ultimoPago,
        estado: isCorriente(ultimoPago) ? 'CORRIENTE' : 'ADEUDO',
      });
    }

    // ✅ orden: más nuevo ingreso arriba
    return Array.from(map.values()).sort((a, b) => b.fechaIngreso.localeCompare(a.fechaIngreso));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.q.trim().toLowerCase();

    return students.filter((st) => {
      if (query.status !== 'ALL' && st.estado !== query.status) return false;
      if (!inRange(st.fechaIngreso, query.dateFrom, query.dateTo)) return false;

      if (!q) return true;
      return (
        st.nombre.toLowerCase().includes(q) ||
        (st.matricula ?? '').toLowerCase().includes(q) ||
        st.carrera.toLowerCase().includes(q)
      );
    });
  }, [students, query]);

  const empty = useMemo(() => !loading && filtered.length === 0, [loading, filtered.length]);

  // ✅ reset page al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [query.q, query.status, query.dateFrom, query.dateTo]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const startIdx = total === 0 ? 0 : (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageItems = filtered.slice(startIdx, endIdx);

  function openLedger(st: StudentRow) {
    setLedgerStudent({
      nombre: st.nombre,
      matricula: st.matricula,
      carrera: st.carrera,
      duracionMeses: st.duracionMeses,
      fechaIngreso: st.fechaIngreso,
      fechaTermino: st.fechaTermino,
    });
    setLedgerOpen(true);
  }

  return (
    <div className={s.wrap}>
      {/* Toolbar (fijo) */}
      <div className={s.toolbar}>
        <input
          className={s.search}
          placeholder="Buscar alumno (nombre, matrícula, carrera)…"
          value={query.q}
          onChange={(e) => setQuery({ ...query, q: e.target.value })}
        />

        <select
          className={s.select}
          value={query.status}
          onChange={(e) => setQuery({ ...query, status: e.target.value as UiQuery['status'] })}
          title="Estado"
        >
          <option value="ALL">Todos</option>
          <option value="CORRIENTE">Corriente</option>
          <option value="ADEUDO">Con adeudo</option>
        </select>

        <input
          className={s.date}
          type="date"
          value={query.dateFrom}
          onChange={(e) => setQuery({ ...query, dateFrom: e.target.value })}
          title="Ingreso desde"
        />
        <input
          className={s.date}
          type="date"
          value={query.dateTo}
          onChange={(e) => setQuery({ ...query, dateTo: e.target.value })}
          title="Ingreso hasta"
        />

        <div className={s.toolbarRight}>
          <Button variant="secondary" onClick={onRefresh} leftIcon={<RefreshCcw size={16} />}>
            Refrescar
          </Button>
        </div>
      </div>

      {error ? <div className={s.error}>{error}</div> : null}

      {/* ✅ SCROLL AREA (solo la tabla) */}
      <div className={s.tableScroll}>
        <div className={s.tableShell}>
          <Table>
            <thead>
              <tr>
                <th className={s.thAlumno}>Alumno</th>
                <th className={s.thCarrera}>Carrera</th>
                <th className={s.thDate}>Ingreso</th>
                <th className={s.thDate}>Término</th>
                <th className={s.thEstado}>Estado</th>
                <th className={s.thActions}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={s.muted}>Cargando…</td>
                </tr>
              ) : empty ? (
                <tr>
                  <td colSpan={6} className={s.muted}>
                    Sin alumnos todavía. Registra el primero ✍️
                  </td>
                </tr>
              ) : (
                pageItems.map((st) => (
                  <tr key={st.key}>
                    <td className={s.tdAlumno}>
                      <button className={s.studentBtn} onClick={() => openLedger(st)} type="button">
                        <span className={s.studentName}>{st.nombre}</span>

                        {/* ✅ “Último pago” ya no se amontona */}
                        <span className={s.studentMeta}>
                          <span className={s.metaLine}>
                            {st.matricula ? `Matrícula: ${st.matricula}` : 'Sin matrícula'}
                          </span>
                          <span className={s.metaLineMuted}>Último pago: {st.ultimoPago}</span>
                        </span>
                      </button>
                    </td>

                    <td className={s.tdCarrera}>
                      <div className={s.carrera}>
                        {/* ✅ carreras largas => ... + title */}
                        <span className={s.carreraName} title={st.carrera}>{st.carrera}</span>
                        <span className={s.carreraMeta}>{st.duracionMeses} meses</span>
                      </div>
                    </td>

                    <td className={s.mono}>{st.fechaIngreso}</td>
                    <td className={s.mono}>{st.fechaTermino}</td>

                    <td>
                      {st.estado === 'CORRIENTE' ? (
                        <Badge tone="ok">Corriente</Badge>
                      ) : (
                        <Badge tone="warn">Adeudo</Badge>
                      )}
                    </td>

                    <td className={s.actionsCell}>
                      <button
                        className={s.iconBtn}
                        onClick={() => openLedger(st)}
                        title="Ver detalle"
                        type="button"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Pager (fijo) */}
      <div className={s.pager}>
        <div className={s.pagerLeft}>
          <span className={s.pagerText}>
            Total alumnos: <b>{total}</b>
            <span className={s.dot}>•</span>
            Mostrando <b>{total === 0 ? 0 : startIdx + 1}</b>–<b>{endIdx}</b>
          </span>
        </div>

        <div className={s.pagerRight}>
          <label className={s.rowsLabel}>
            Filas
            <select
              className={s.rowsSelect}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

          <button
            className={s.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            type="button"
            title="Anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <span className={s.pageInfo}>
            Página <b>{safePage}</b> de <b>{totalPages}</b>
          </span>

          <button
            className={s.pageBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            type="button"
            title="Siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <StudentLedgerModal
        open={ledgerOpen}
        onClose={() => setLedgerOpen(false)}
        student={ledgerStudent}
        allReceipts={items}
      />
    </div>
  );
}
