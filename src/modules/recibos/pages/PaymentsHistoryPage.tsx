'use client';

import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';

import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';
import Button from '@/shared/ui/Button/Button';
import Input from '@/shared/ui/Input/Input';
import Table from '@/shared/ui/Table/Table';

import s from './PaymentsHistoryPage.module.css';

type Status = 'EMITIDO' | 'PAGADO' | 'CANCELADO';

type PaymentRow = {
  id: string;
  folio: string;

  // ✅ fecha de creación / emisión (registro)
  fechaEmision: string; // 2025-12-19

  alumno: string;
  carrera: string;
  concepto: string;
  valor: number;

  status: Status;

  // ✅ se habilita si status es PAGADO o CANCELADO
  motivo?: string;

  // ✅ se habilita solo si status es CANCELADO
  comentario?: string;

  // ✅ fecha auto al marcar PAGADO (al guardar)
  fechaPago?: string;

  // interno (no lo mostramos por ahora, por si luego lo quieres)
  fechaCancelacion?: string;
};

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function buildPatch(original: PaymentRow, draft?: Partial<PaymentRow>) {
  if (!draft) return null;

  const patch: Partial<PaymentRow> = {};
  const keys: (keyof PaymentRow)[] = ['status', 'motivo', 'comentario'];

  for (const k of keys) {
    if (k in draft) {
      const next = draft[k];
      const prev = original[k];
      if (next !== prev) (patch as any)[k] = next;
    }
  }

  return Object.keys(patch).length ? patch : null;
}

export default function PaymentsHistoryPage() {
  // ⚠️ Mock (cámbialo por tu hook real)
  const [rows, setRows] = useState<PaymentRow[]>([
    {
      id: '1',
      folio: 'FOL-0001',
      fechaEmision: '2025-12-19',
      alumno: 'Diana Pérez',
      carrera: 'Enfermería',
      concepto: 'Colegiatura',
      valor: 330,
      status: 'EMITIDO',
      motivo: '',
      comentario: '',
    },
  ]);

  // drafts por fila
  const [drafts, setDrafts] = useState<Record<string, Partial<PaymentRow>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // filtros
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'ALL' | Status>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return rows.filter((r) => {
      if (status !== 'ALL' && r.status !== status) return false;
      if (dateFrom && r.fechaEmision < dateFrom) return false;
      if (dateTo && r.fechaEmision > dateTo) return false;

      if (!query) return true;
      return (
        r.folio.toLowerCase().includes(query) ||
        r.alumno.toLowerCase().includes(query) ||
        r.carrera.toLowerCase().includes(query) ||
        r.concepto.toLowerCase().includes(query)
      );
    });
  }, [rows, q, status, dateFrom, dateTo]);

  // KPIs
  const kpis = useMemo(() => {
    const total = rows.length;
    const emitidos = rows.filter((x) => x.status === 'EMITIDO').length;
    const pagados = rows.filter((x) => x.status === 'PAGADO').length;
    const cancelados = rows.filter((x) => x.status === 'CANCELADO').length;

    const totalRecibido = rows
      .filter((x) => x.status === 'PAGADO')
      .reduce((acc, x) => acc + (Number(x.valor) || 0), 0);

    return { total, emitidos, pagados, cancelados, totalRecibido };
  }, [rows]);

  function getRowView(r: PaymentRow) {
    const d = drafts[r.id];
    return {
      status: (d?.status ?? r.status) as Status,
      motivo: String(d?.motivo ?? r.motivo ?? ''),
      comentario: String(d?.comentario ?? r.comentario ?? ''),
    };
  }

  function setDraft(id: string, patch: Partial<PaymentRow>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }));
  }

  function isDirty(r: PaymentRow) {
    return !!buildPatch(r, drafts[r.id]);
  }

  async function saveRow(id: string) {
    const original = rows.find((x) => x.id === id);
    if (!original) return;

    const patch = buildPatch(original, drafts[id]);
    if (!patch) return;

    const nextStatus = (patch.status ?? original.status) as Status;
    const nextMotivo = (patch.motivo ?? original.motivo ?? '').trim();
    const nextComentario = (patch.comentario ?? original.comentario ?? '').trim();

    // ✅ Reglas:
    // - Motivo habilitado en PAGADO o CANCELADO (pero obligatorio SOLO en CANCELADO)
    // - Comentario habilitado SOLO en CANCELADO (no obligatorio, a menos que tú quieras)
    if (nextStatus === 'CANCELADO' && !nextMotivo) {
      alert('Motivo obligatorio para CANCELADO.');
      return;
    }

    setSavingId(id);

    try {
      // 🔁 aquí iría tu PATCH real
      // await api.patch(`/payments/${id}`, {...patch})

      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;

          if (nextStatus === 'PAGADO') {
            return {
              ...r,
              ...patch,
              status: 'PAGADO',
              fechaPago: todayISO(),
              fechaCancelacion: undefined,
              // motivo permitido en pagado (se queda)
              motivo: nextMotivo,
              // comentario no aplica en pagado
              comentario: r.comentario,
            };
          }

          if (nextStatus === 'CANCELADO') {
            return {
              ...r,
              ...patch,
              status: 'CANCELADO',
              fechaCancelacion: todayISO(),
              fechaPago: undefined,
              motivo: nextMotivo,
              comentario: nextComentario,
            };
          }

          // EMITIDO (resetea motivo/comentario)
          return {
            ...r,
            ...patch,
            status: 'EMITIDO',
            fechaPago: undefined,
            fechaCancelacion: undefined,
            motivo: undefined,
            comentario: undefined,
          };
        })
      );

      // limpia draft de esa fila
      setDrafts((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Card
      title="Historial de pagos"
      subtitle="Edita estatus, motivo y comentario. Guarda por fila."
      right={
        <div className={s.headerActions}>
          <div className={s.kpis}>
            <Badge tone="info">Total: {kpis.total}</Badge>
            <Badge tone="info">Emitidos: {kpis.emitidos}</Badge>
            <Badge tone="success">Pagados: {kpis.pagados}</Badge>
            <Badge tone="danger">Cancelados: {kpis.cancelados}</Badge>
            <Badge tone="neutral">Recibido: {fmtMoney(kpis.totalRecibido)}</Badge>
          </div>
        </div>
      }
      className={s.card}
    >
      <div className={s.wrap}>
        {/* ✅ filtros con layout pro */}
        <div className={s.filters}>
          <div className={s.searchWrap}>
            <Input
              label=""
              placeholder="Buscar folio, alumno, carrera o concepto…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select className={s.select} value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="ALL">Todos</option>
            <option value="EMITIDO">Emitido</option>
            <option value="PAGADO">Pagado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>

          <input className={s.date} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input className={s.date} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <div className={s.tableShell}>
          <Table>
            <thead>
              <tr>
                <th className={s.colFolio}>Folio</th>
                <th className={s.colFecha}>Fecha emisión</th>
                <th className={s.colFechaPago}>Fecha pago</th>
                <th className={s.colAlumno}>Alumno</th>
                <th className={s.colCarrera}>Carrera</th>
                <th className={s.colConcepto}>Concepto</th>
                <th className={s.colValor}>Valor</th>
                <th className={s.colEstatus}>Estatus</th>
                <th className={s.colMotivo}>Motivo</th>
                <th className={s.colComentario}>Comentario</th>
                <th className={s.colAccion}>Acción</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => {
                const v = getRowView(r);
                const dirty = isDirty(r);

                const motivoEnabled = v.status === 'PAGADO' || v.status === 'CANCELADO';
                const comentarioEnabled = v.status === 'CANCELADO';

                return (
                  <tr key={r.id} className={v.status === 'CANCELADO' ? s.rowCanceled : undefined}>
                    <td className={s.mono}>{r.folio}</td>
                    <td className={s.mono}>{r.fechaEmision}</td>
                    <td className={s.mono}>{r.fechaPago ?? '—'}</td>

                    <td className={s.ellipsis} title={r.alumno}>{r.alumno}</td>
                    <td className={s.ellipsis} title={r.carrera}>{r.carrera}</td>
                    <td className={s.ellipsis} title={r.concepto}>{r.concepto}</td>

                    <td className={s.mono}>{fmtMoney(r.valor)}</td>

                    <td>
                      <select
                        className={s.statusSelect}
                        value={v.status}
                        onChange={(e) => {
                          const next = e.target.value as Status;
                          setDraft(r.id, { status: next });

                          // si vuelve a emitido, limpias campos
                          if (next === 'EMITIDO') {
                            setDraft(r.id, { motivo: '', comentario: '' });
                          }

                          // si pasa a pagado, comentario no aplica
                          if (next === 'PAGADO') {
                            setDraft(r.id, { comentario: '' });
                          }
                        }}
                      >
                        <option value="EMITIDO">Emitido</option>
                        <option value="PAGADO">Pagado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </td>

                    <td>
                      <input
                        className={s.inlineInput}
                        value={v.motivo}
                        placeholder={motivoEnabled ? 'Motivo…' : '—'}
                        onChange={(e) => setDraft(r.id, { motivo: e.target.value })}
                        disabled={!motivoEnabled}
                      />
                    </td>

                    <td>
                      <input
                        className={s.inlineInput}
                        value={v.comentario}
                        placeholder={comentarioEnabled ? 'Comentario…' : '—'}
                        onChange={(e) => setDraft(r.id, { comentario: e.target.value })}
                        disabled={!comentarioEnabled}
                      />
                    </td>

                    <td className={s.actionsCell}>
                      <Button
                        variant="secondary"
                        leftIcon={<Save size={16} />}
                        disabled={!dirty || savingId === r.id}
                        loading={savingId === r.id}
                        onClick={() => saveRow(r.id)}
                      >
                        Guardar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        <div className={s.footer}>
          <span>
            Total: <b>{rows.length}</b> • Filtrados: <b>{filtered.length}</b>
          </span>
        </div>
      </div>
    </Card>
  );
}
