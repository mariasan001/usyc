'use client';

import { useMemo, useState } from 'react';
import { Eye, Printer, RefreshCcw, Trash2 } from 'lucide-react';

import Table from '@/shared/ui/Table/Table';
import Badge from '@/shared/ui/Badge/Badge';
import Button from '@/shared/ui/Button/Button';
import Modal from '@/shared/ui/Modal/Modal';
import Input from '@/shared/ui/Input/Input';

import type { Receipt } from '../../types/receipt.types';
import s from './ReceiptsTable.module.css';
import { encodeReceiptQr } from '@/qr/utils/qr.codec';

import StudentLedgerModal from '../StudentLedgerModal/StudentLedgerModal';
import type { StudentRef } from '../../utils/student-ledger.utils';

type UiQuery = {
  q: string;
  status: 'ALL' | 'VALID' | 'CANCELLED';
  dateFrom: string;
  dateTo: string;
};

function openPrint(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function ReceiptsTable({
  items,
  loading,
  error,
  query,
  setQuery,
  onRefresh,
  onCancel,
}: {
  items: Receipt[];
  loading?: boolean;
  error?: string | null;
  query: UiQuery;
  setQuery: (q: UiQuery) => void;
  onRefresh: () => Promise<void>;
  onCancel: (folio: string, reason: string) => Promise<any>;
}) {
  const [view, setView] = useState<Receipt | null>(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Receipt | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);

  // ✅ Selección para imprimir lote
  const [selectedFolios, setSelectedFolios] = useState<Set<string>>(new Set());

  const empty = useMemo(() => !loading && items.length === 0, [loading, items.length]);
const [ledgerOpen, setLedgerOpen] = useState(false);
const [ledgerStudent, setLedgerStudent] = useState<StudentRef | null>(null);

function openLedger(r: Receipt) {
  setLedgerStudent({ nombre: r.alumno.nombre, matricula: r.alumno.matricula ?? null });
  setLedgerOpen(true);
}

  const allVisibleSelected = useMemo(() => {
    if (items.length === 0) return false;
    return items.every((r) => selectedFolios.has(r.folio));
  }, [items, selectedFolios]);

  const someVisibleSelected = useMemo(() => {
    return items.some((r) => selectedFolios.has(r.folio));
  }, [items, selectedFolios]);

  const selectedCount = selectedFolios.size;

  function toggleOne(folio: string, checked: boolean) {
    setSelectedFolios((prev) => {
      const next = new Set(prev);
      if (checked) next.add(folio);
      else next.delete(folio);
      return next;
    });
  }

  function toggleAllVisible(checked: boolean) {
    setSelectedFolios((prev) => {
      const next = new Set(prev);
      for (const r of items) {
        if (checked) next.add(r.folio);
        else next.delete(r.folio);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedFolios(new Set());
  }

  function printOne(folio: string) {
    openPrint(`/recibos/print?folio=${encodeURIComponent(folio)}`);
  }

  function printSelected() {
    if (selectedCount === 0) return;
    const folios = Array.from(selectedFolios).join(',');
    openPrint(`/recibos/print?folios=${encodeURIComponent(folios)}`);
  }

  function openCancel(r: Receipt) {
    setCancelTarget(r);
    setCancelReason('');
    setCancelOpen(true);
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    if (!cancelReason.trim()) return;

    try {
      setCanceling(true);
      await onCancel(cancelTarget.folio, cancelReason.trim());
      setCancelOpen(false);
      setCancelTarget(null);

      // (opcional) si cancelas un recibo seleccionado, lo dejamos seleccionado.
      // Si quieres quitarlo: setSelectedFolios(prev=>{...})
    } finally {
      setCanceling(false);
    }
  }

  return (
    <div className={s.wrap}>
      <div className={s.toolbar}>
        <input
          className={s.search}
          placeholder="Buscar (folio, alumno, concepto)…"
          value={query.q}
          onChange={(e) => setQuery({ ...query, q: e.target.value })}
        />

        <select
          className={s.select}
          value={query.status}
          onChange={(e) => setQuery({ ...query, status: e.target.value as UiQuery['status'] })}
        >
          <option value="ALL">Todos</option>
          <option value="VALID">Válidos</option>
          <option value="CANCELLED">Cancelados</option>
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
          {selectedCount > 0 ? (
            <>
              <span className={s.selCount}>{selectedCount} seleccionados</span>
              <button className={s.clearSel} onClick={clearSelection} type="button">
                Limpiar
              </button>
            </>
          ) : null}

          <Button
            variant="secondary"
            onClick={printSelected}
            leftIcon={<Printer size={16} />}
            disabled={selectedCount === 0}
          >
            Imprimir seleccionados
          </Button>

          <Button variant="secondary" onClick={onRefresh} leftIcon={<RefreshCcw size={16} />}>
            Refrescar
          </Button>
        </div>
      </div>

      {error ? <div className={s.error}>{error}</div> : null}

      <Table>
        <thead>
          <tr>
            <th className={s.checkCell}>
              <input
                className={s.check}
                type="checkbox"
                checked={allVisibleSelected}
                ref={(el) => {
                  if (!el) return;
                  el.indeterminate = !allVisibleSelected && someVisibleSelected;
                }}
                onChange={(e) => toggleAllVisible(e.target.checked)}
                title="Seleccionar todos los visibles"
              />
            </th>
            <th>Folio</th>
            <th>Alumno</th>
            <th>Concepto</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Estatus</th>
            <th style={{ textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className={s.muted}>
                Cargando…
              </td>
            </tr>
          ) : empty ? (
            <tr>
              <td colSpan={8} className={s.muted}>
                Sin recibos (aún). Genera el primero 💳
              </td>
            </tr>
          ) : (
            items.map((r) => (
              <tr key={r.folio}>
                <td className={s.checkCell}>
                  <input
                    className={s.check}
                    type="checkbox"
                    checked={selectedFolios.has(r.folio)}
                    onChange={(e) => toggleOne(r.folio, e.target.checked)}
                    title="Seleccionar para imprimir"
                  />
                </td>

                <td className={s.mono}>{r.folio}</td>
               <td>
  <button className={s.studentBtn} onClick={() => openLedger(r)} type="button">
    {r.alumno.nombre}
  </button>
</td>
                <td>{r.concepto}</td>
                <td className={s.mono}>${r.monto.toFixed(2)}</td>
                <td className={s.mono}>{r.fechaPago}</td>
                <td>
                  {r.status === 'VALID' ? <Badge tone="ok">Válido</Badge> : <Badge tone="warn">Cancelado</Badge>}
                </td>

                <td className={s.actionsCell}>
                  <button className={s.iconBtn} onClick={() => setView(r)} title="Ver">
                    <Eye size={16} />
                  </button>

                  <button className={s.iconBtn} onClick={() => printOne(r.folio)} title="Imprimir">
                    <Printer size={16} />
                  </button>

                  <button
                    className={s.iconBtn}
                    onClick={() => openCancel(r)}
                    title="Cancelar"
                    disabled={r.status === 'CANCELLED'}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal ver detalle */}
      <Modal open={Boolean(view)} onClose={() => setView(null)} title="Detalle del recibo">
        {view ? (
          <div className={s.detail}>
            <div>
              <span>Folio</span>
              <b>{view.folio}</b>
            </div>
            <div>
              <span>Alumno</span>
              <b>{view.alumno.nombre}</b>
            </div>
            <div>
              <span>Matrícula</span>
              <b>{view.alumno.matricula ?? '—'}</b>
            </div>
            <div>
              <span>Concepto</span>
              <b>{view.concepto}</b>
            </div>
            <div>
              <span>Monto</span>
              <b>${view.monto.toFixed(2)}</b>
            </div>
            <div className={s.full}>
              <span>Monto en letras</span>
              <b>{view.montoLetras}</b>
            </div>
            <div>
              <span>Fecha</span>
              <b>{view.fechaPago}</b>
            </div>
            <div>
              <span>Estatus</span>
              <b>{view.status === 'VALID' ? 'Válido' : 'Cancelado'}</b>
            </div>
            {view.status === 'CANCELLED' ? (
              <div className={s.full}>
                <span>Motivo</span>
                <b>{view.cancelReason ?? '—'}</b>
              </div>
            ) : null}

            <div className={s.full}>
              <span>Contenido QR</span>
              <b className={s.mono}>{encodeReceiptQr(view.folio)}</b>
            </div>

            <div className={s.full}>
              <Button onClick={() => printOne(view.folio)} leftIcon={<Printer size={16} />}>
                Imprimir este recibo
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
<StudentLedgerModal
  open={ledgerOpen}
  onClose={() => setLedgerOpen(false)}
  student={ledgerStudent}
  allReceipts={items}
/>
      {/* Modal cancelar */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancelar recibo">
        <div className={s.cancelBox}>
          <p className={s.cancelText}>
            Vas a cancelar el folio <b>{cancelTarget?.folio}</b>. Esto quedará registrado.
          </p>

          <Input
            label="Motivo (obligatorio)"
            placeholder="Ej: pago duplicado, error de captura…"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <div className={s.cancelActions}>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              Volver
            </Button>
            <Button
              variant="danger"
              onClick={confirmCancel}
              disabled={!cancelReason.trim()}
              loading={canceling}
            >
              Confirmar cancelación
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
