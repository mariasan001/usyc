// src/features/receipts/ui/PaymentsHistoryTable/PaymentsHistoryTable.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Printer, XCircle } from 'lucide-react';

import Table from '@/shared/ui/Table/Table';
import Badge from '@/shared/ui/Badge/Badge';
import Button from '@/shared/ui/Button/Button';

import type { Payment } from '../../types/payment.types';

import s from './PaymentsHistoryTable.module.css';
import { PaymentsQuery } from '../../Hook/usePayments';

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function PaymentsHistoryTable({
  items,
  rawTotal,
  loading,
  error,
  query,
  setQuery,
  onRefresh,
  selected,
  setSelected,
  onCancel,
  onPrint,
}: {
  items: Payment[];
  rawTotal: number;
  loading?: boolean;
  error?: string | null;
  query: PaymentsQx|uery;
  setQuery: (q: PaymentsQuery) => void;
  onRefresh: () => Promise<void>;

  selected: Payment[];
  setSelected: (v: Payment[]) => void;

  onCancel: (p: Payment) => void;
  onPrint: (p: Payment) => void;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => setPage(1), [query.q, query.status, query.dateFrom, query.dateTo]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const startIdx = total === 0 ? 0 : (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageItems = items.slice(startIdx, endIdx);

  const selectedIds = useMemo(() => new Set(selected.map((x) => x.id)), [selected]);

  function toggleRow(p: Payment) {
    if (selectedIds.has(p.id)) {
      setSelected(selected.filter((x) => x.id !== p.id));
    } else {
      setSelected([...selected, p]);
    }
  }

  function togglePageAll() {
    const pageIds = new Set(pageItems.map((x) => x.id));
    const allSelected = pageItems.length > 0 && pageItems.every((x) => selectedIds.has(x.id));

    if (allSelected) {
      setSelected(selected.filter((x) => !pageIds.has(x.id)));
    } else {
      const merged = new Map<string, Payment>();
      for (const s of selected) merged.set(s.id, s);
      for (const p of pageItems) merged.set(p.id, p);
      setSelected(Array.from(merged.values()));
    }
  }

  const allSelectedOnPage = pageItems.length > 0 && pageItems.every((x) => selectedIds.has(x.id));

  return (
    <div className={s.wrap}>
      <div className={s.toolbar}>
        <input
          className={s.search}
          placeholder="Buscar folio, alumno, concepto…"
          value={query.q}
          onChange={(e) => setQuery({ ...query, q: e.target.value })}
        />

        <select
          className={s.select}
          value={query.status}
          onChange={(e) => setQuery({ ...query, status: e.target.value as any })}
          title="Estatus"
        >
          <option value="ALL">Todos</option>
          <option value="EMITIDO">Emitido</option>
          <option value="CANCELADO">Cancelado</option>
        </select>

        <input
          className={s.date}
          type="date"
          value={query.dateFrom}
          onChange={(e) => setQuery({ ...query, dateFrom: e.target.value })}
          title="Desde"
        />
        <input
          className={s.date}
          type="date"
          value={query.dateTo}
          onChange={(e) => setQuery({ ...query, dateTo: e.target.value })}
          title="Hasta"
        />

        <div className={s.toolbarRight}>
          <Button variant="secondary" onClick={onRefresh}>
            Refrescar
          </Button>
        </div>
      </div>

      {error ? <div className={s.error}>{error}</div> : null}

      <div className={s.tableShell}>
        <Table>
          <thead>
            <tr>
              <th className={s.thCheck}>
                <input type="checkbox" checked={allSelectedOnPage} onChange={togglePageAll} />
              </th>
              <th className={s.thFolio}>Folio</th>
              <th className={s.thAlumno}>Alumno</th>
              <th className={s.thCarrera}>Carrera</th>
              <th className={s.thDate}>Fecha</th>
              <th className={s.thMoney}>Valor</th>
              <th className={s.thConcepto}>Concepto</th>
              <th className={s.thStatus}>Estatus</th>
              <th className={s.thMotivo}>Motivo</th>
              <th className={s.thActions}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className={s.muted}>Cargando…</td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={10} className={s.muted}>Sin pagos aún. Registra el primero 💸</td>
              </tr>
            ) : (
              pageItems.map((p) => (
                <tr key={p.id} className={p.estatus === 'CANCELADO' ? s.rowCanceled : undefined}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleRow(p)}
                    />
                  </td>

                  <td className={s.mono}>{p.folio}</td>

                  <td className={s.tdAlumno}>
                    <div className={s.alumno}>
                      <span className={s.alumnoName}>{p.alumnoNombre}</span>
                      <span className={s.alumnoMeta}>
                        {p.alumnoMatricula ? `Matrícula: ${p.alumnoMatricula}` : 'Sin matrícula'}
                      </span>
                    </div>
                  </td>

                  <td className={s.ellipsis} title={p.carrera}>{p.carrera}</td>
                  <td className={s.mono}>{p.fecha}</td>
                  <td className={s.mono}>{fmtMoney(p.valor)}</td>
                  <td className={s.ellipsis} title={p.concepto}>{p.concepto}</td>

                  <td>
                    {p.estatus === 'EMITIDO' ? (
                      <Badge tone="ok">Emitido</Badge>
                    ) : (
                      <Badge tone="warn">Cancelado</Badge>
                    )}
                  </td>

                  <td className={s.motivo} title={p.motivoCancelacion ?? ''}>
                    {p.estatus === 'CANCELADO' ? (p.motivoCancelacion ?? '—') : '—'}
                  </td>

                  <td className={s.actionsCell}>
                    <button className={s.iconBtn} onClick={() => onPrint(p)} title="Imprimir" type="button">
                      <Printer size={16} />
                    </button>

                    <button
                      className={s.iconBtn}
                      onClick={() => onCancel(p)}
                      title="Cancelar"
                      type="button"
                      disabled={p.estatus === 'CANCELADO'}
                    >
                      <XCircle size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <div className={s.pager}>
        <div className={s.pagerLeft}>
          <span className={s.pagerText}>
            Total: <b>{rawTotal}</b> • Filtrados: <b>{total}</b> • Seleccionados: <b>{selected.length}</b>
          </span>
        </div>

        <div className={s.pagerRight}>
          <label className={s.rowsLabel}>
            Filas
            <select className={s.rowsSelect} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

          <button className={s.pageBtn} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
            ‹
          </button>

          <span className={s.pageInfo}>
            Página <b>{safePage}</b> de <b>{totalPages}</b>
          </span>

          <button className={s.pageBtn} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
