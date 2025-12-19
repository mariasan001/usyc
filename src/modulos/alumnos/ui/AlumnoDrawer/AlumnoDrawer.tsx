'use client';

import { useEffect, useMemo, useState } from 'react';
import s from './AlumnoDrawer.module.css';

import type { Alumno, ID } from '../../types/alumnos.tipos';
import { getCarreraById, getEscolaridadById, getPlantelById } from '../../constants/catalogos.constants';

type DrawerTab = 'RESUMEN' | 'PROYECCION' | 'PAGOS' | 'EXTRAS';

type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
type PaymentType = 'MENSUALIDAD' | 'EXTRA';
type PaymentStatus = 'PAGADO' | 'PENDIENTE';

type PaymentItem = {
  id: string;
  alumnoId: ID;
  type: PaymentType;
  concept: string;
  amount: number;
  date: string; // YYYY-MM-DD
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string; // ISO
};

type ProjectionItem = {
  idx: number; // 1..N
  dueDate: string; // YYYY-MM-DD
  concept: string;
  amount: number;
  status: PaymentStatus;
  method?: PaymentMethod;
  paidAt?: string; // YYYY-MM-DD
  paymentId?: string;
};

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addMonthsISO(iso: string, monthsToAdd: number) {
  const [y, m, d] = iso.split('-').map((x) => Number(x));
  const base = new Date(y, (m - 1) + monthsToAdd, d);
  // Normaliza overflow (ej. 31 + febrero)
  const safe = new Date(base.getFullYear(), base.getMonth(), Math.min(d, daysInMonth(base.getFullYear(), base.getMonth())));
  return toISODate(safe);
}

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function todayISO() {
  return toISODate(new Date());
}

function cmpISO(a: string, b: string) {
  // YYYY-MM-DD lexicográfico funciona
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function uid(prefix = 'p') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function estadoLabel(e: Alumno['estado']) {
  if (e === 'ACTIVO') return 'Activo';
  if (e === 'POR_VENCER') return 'Por vencer';
  return 'Egresado';
}

export default function AlumnoDrawer({
  open,
  alumno,
  onClose,
}: {
  open: boolean;
  alumno: Alumno | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DrawerTab>('RESUMEN');

  // Pagos registrados (mock local por ahora)
  const [payments, setPayments] = useState<PaymentItem[]>([]);

  // Form: registrar pago mensualidad
  const [payDate, setPayDate] = useState<string>(todayISO());
  const [payMethod, setPayMethod] = useState<PaymentMethod>('EFECTIVO');

  // Form: extra
  const [extraConcept, setExtraConcept] = useState<string>('Curso / Conferencia');
  const [extraAmount, setExtraAmount] = useState<string>('0');
  const [extraDate, setExtraDate] = useState<string>(todayISO());
  const [extraMethod, setExtraMethod] = useState<PaymentMethod>('TRANSFERENCIA');

  // Reset “limpio” cuando abres/cambias alumno
  useEffect(() => {
    if (!open) return;
    setTab('RESUMEN');
    setPayDate(todayISO());
    setPayMethod('EFECTIVO');
    setExtraConcept('Curso / Conferencia');
    setExtraAmount('0');
    setExtraDate(todayISO());
    setExtraMethod('TRANSFERENCIA');
  }, [open, alumno?.id]);

  // Mock inicial (opcional) para que no esté vacío:
  useEffect(() => {
    if (!open || !alumno) return;

    // Si ya hay pagos para este alumno, no reinyectes
    const hasAny = payments.some((p) => p.alumnoId === alumno.id);
    if (hasAny) return;

    // ejemplo: sin pagos registrados al inicio
    // (si quieres demo, aquí puedes meter 1 pago)
    // setPayments((prev) => [...prev, { ... }]);
  }, [open, alumno, payments]);

  const esc = useMemo(() => getEscolaridadById(alumno?.escolaridadId ?? null), [alumno?.escolaridadId]);
  const car = useMemo(() => getCarreraById(alumno?.carreraId ?? null), [alumno?.carreraId]);
  const pla = useMemo(() => getPlantelById(alumno?.plantelId ?? null), [alumno?.plantelId]);

  const alumnoPayments = useMemo(() => {
    if (!alumno) return [];
    return payments
      .filter((p) => p.alumnoId === alumno.id)
      .sort((a, b) => cmpISO(b.date, a.date));
  }, [payments, alumno]);

  const projection = useMemo<ProjectionItem[]>(() => {
    if (!alumno) return [];

    // Pagos de mensualidades registrados -> mapa por (YYYY-MM-DD mensualidad) con el pago más “reciente”
    const mensualidades = alumnoPayments.filter((p) => p.type === 'MENSUALIDAD');

    // Indexa por date
    const paidByDate = new Map<string, PaymentItem>();
    for (const p of mensualidades) {
      const prev = paidByDate.get(p.date);
      if (!prev) paidByDate.set(p.date, p);
      else {
        // si hay duplicados, preferimos el más nuevo
        if (prev.createdAt < p.createdAt) paidByDate.set(p.date, p);
      }
    }

    const out: ProjectionItem[] = [];
    for (let i = 0; i < alumno.duracionMeses; i++) {
      const due = addMonthsISO(alumno.fechaIngreso, i);
      const pay = paidByDate.get(due);

      out.push({
        idx: i + 1,
        dueDate: due,
        concept: `Mensualidad ${i + 1}`,
        amount: alumno.precioMensual,
        status: pay ? 'PAGADO' : 'PENDIENTE',
        method: pay?.method,
        paidAt: pay?.date,
        paymentId: pay?.id,
      });
    }

    return out;
  }, [alumno, alumnoPayments]);

  const totals = useMemo(() => {
    if (!alumno) {
      return {
        totalPlan: 0,
        totalExtras: 0,
        totalPagado: 0,
        saldo: 0,
        pagados: 0,
        pendientes: 0,
        vencidos: 0,
        nextDue: null as ProjectionItem | null,
      };
    }

    const totalPlan = alumno.precioMensual * alumno.duracionMeses;

    const extras = alumnoPayments.filter((p) => p.type === 'EXTRA');
    const totalExtras = extras.reduce((acc, p) => acc + p.amount, 0);

    const pagosPagados = alumnoPayments.filter((p) => p.status === 'PAGADO');
    const totalPagado = pagosPagados.reduce((acc, p) => acc + p.amount, 0);

    const saldo = Math.max(0, (totalPlan + totalExtras) - totalPagado);

    const pagados = projection.filter((x) => x.status === 'PAGADO').length;
    const pendientes = projection.filter((x) => x.status === 'PENDIENTE').length;

    const t = todayISO();
    const vencidos = projection.filter((x) => x.status === 'PENDIENTE' && cmpISO(x.dueDate, t) < 0).length;

    const nextDue = projection.find((x) => x.status === 'PENDIENTE') ?? null;

    return { totalPlan, totalExtras, totalPagado, saldo, pagados, pendientes, vencidos, nextDue };
  }, [alumno, alumnoPayments, projection]);

  function addMensualidadPayment() {
    if (!alumno) return;

    // Evita doble pago exacto (misma fecha) si ya está pagado
    const exists = alumnoPayments.some(
      (p) => p.type === 'MENSUALIDAD' && p.date === payDate && p.status === 'PAGADO'
    );
    if (exists) return;

    const item: PaymentItem = {
      id: uid('pay'),
      alumnoId: alumno.id,
      type: 'MENSUALIDAD',
      concept: 'Mensualidad',
      amount: alumno.precioMensual,
      date: payDate,
      method: payMethod,
      status: 'PAGADO',
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [item, ...prev]);
  }

  function addExtraPayment() {
    if (!alumno) return;

    const amt = Number(extraAmount);
    if (!Number.isFinite(amt) || amt <= 0) return;

    const item: PaymentItem = {
      id: uid('extra'),
      alumnoId: alumno.id,
      type: 'EXTRA',
      concept: extraConcept.trim() || 'Pago extra',
      amount: amt,
      date: extraDate,
      method: extraMethod,
      status: 'PAGADO',
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [item, ...prev]);
    setExtraAmount('0');
  }

  function togglePaymentStatus(paymentId: string) {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, status: p.status === 'PAGADO' ? 'PENDIENTE' : 'PAGADO' }
          : p
      )
    );
  }

  function removePayment(paymentId: string) {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  }

  function printReceipt(paymentId: string) {
    // Mock por ahora
    // Luego aquí conectas a /recibos o a tu generador PDF
    // eslint-disable-next-line no-alert
    alert(`(Mock) Generar comprobante para: ${paymentId}`);
  }

  if (!open) return null;

  const escNombre = esc?.nombre ?? '—';
  const carNombre = car?.nombre ?? '—';
  const plaNombre = pla?.nombre ?? '—';

  return (
    <div className={s.backdrop} onMouseDown={onClose} role="presentation">
      <aside className={s.drawer} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className={s.header}>
          <div className={s.headerText}>
            <div className={s.title}>Detalle financiero</div>
            <div className={s.subtitle}>Proyección completa, historial y recibos.</div>
          </div>

          <button className={s.close} onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        {!alumno ? (
          <div className={s.empty}>Sin selección.</div>
        ) : (
          <div className={s.content}>
            {/* Identity pill */}
            <div className={s.identity}>
              <div className={s.avatar}>{(alumno.nombre?.trim()?.[0] ?? 'A').toUpperCase()}</div>
              <div className={s.identityMain}>
                <div className={s.identityName} title={alumno.nombre}>
                  {alumno.nombre}
                </div>
                <div className={s.identityMeta}>
                  <span className={s.mono}>{alumno.matricula}</span>
                  <span className={s.dot}>•</span>
                  <span className={`${s.pill} ${s[`pill_${alumno.estado}`]}`}>{estadoLabel(alumno.estado)}</span>
                </div>
              </div>
            </div>

            {/* Sticky summary */}
            <div className={s.stickySummary}>
              <div className={s.kpiRow}>
                <div className={s.kpiBox}>
                  <span>Total del plan</span>
                  <b>{formatMXN(totals.totalPlan + totals.totalExtras)}</b>
                </div>
                <div className={s.kpiBox}>
                  <span>Pagado</span>
                  <b>{formatMXN(totals.totalPagado)}</b>
                </div>
                <div className={s.kpiBox}>
                  <span>Saldo</span>
                  <b>{formatMXN(totals.saldo)}</b>
                </div>
              </div>

              <div className={s.statsRow}>
                <div>
                  <b>{totals.pagados}</b>
                  <span>Pagados</span>
                </div>
                <div>
                  <b>{totals.pendientes}</b>
                  <span>Pendientes</span>
                </div>
                <div>
                  <b>{totals.vencidos}</b>
                  <span>Vencidos</span>
                </div>
              </div>

              <div className={s.tabs}>
                <button className={`${s.tab} ${tab === 'RESUMEN' ? s.tabActive : ''}`} onClick={() => setTab('RESUMEN')}>
                  Resumen
                </button>
                <button className={`${s.tab} ${tab === 'PROYECCION' ? s.tabActive : ''}`} onClick={() => setTab('PROYECCION')}>
                  Proyección
                </button>
                <button className={`${s.tab} ${tab === 'PAGOS' ? s.tabActive : ''}`} onClick={() => setTab('PAGOS')}>
                  Pagos
                </button>
                <button className={`${s.tab} ${tab === 'EXTRAS' ? s.tabActive : ''}`} onClick={() => setTab('EXTRAS')}>
                  Extras
                </button>
              </div>
            </div>

            {/* Panels */}
            {tab === 'RESUMEN' ? (
              <section className={s.panel}>
                <div className={s.panelTitleRow}>
                  <div className={s.panelTitle}>Resumen</div>
                  <div className={s.panelHint}>Total, pagado y saldo pendiente.</div>
                </div>

                <div className={s.summaryGrid}>
                  <div className={s.summaryCard}>
                    <div className={s.summaryLabel}>Próximo por pagar</div>
                    {totals.nextDue ? (
                      <div className={s.nextPay}>
                        <div className={s.nextPayLeft}>
                          <span className={s.mono}>{totals.nextDue.dueDate}</span>
                          <span className={s.dot}>•</span>
                          <b>{totals.nextDue.concept}</b>
                        </div>
                        <div className={s.nextPayRight}>
                          <b>{formatMXN(totals.nextDue.amount)}</b>
                        </div>
                      </div>
                    ) : (
                      <div className={s.muted}>Todo el plan está pagado ✅</div>
                    )}
                  </div>

                  <div className={s.summaryCard}>
                    <div className={s.summaryLabel}>Plan</div>
                    <div className={s.kvGrid}>
                      <div className={s.kv}><span>Ingreso</span><b className={s.mono}>{alumno.fechaIngreso}</b></div>
                      <div className={s.kv}><span>Término</span><b className={s.mono}>{alumno.fechaTermino}</b></div>
                      <div className={s.kv}><span>Duración</span><b>{alumno.duracionMeses} meses</b></div>
                      <div className={s.kv}><span>Precio mensual</span><b>{formatMXN(alumno.precioMensual)}</b></div>
                    </div>
                  </div>

                  <div className={s.summaryCard}>
                    <div className={s.summaryLabel}>Academia</div>
                    <div className={s.kvGrid}>
                      <div className={s.kv}><span>Escolaridad</span><b>{escNombre}</b></div>
                      <div className={s.kv}><span>Carrera</span><b title={carNombre}>{carNombre}</b></div>
                      <div className={s.kv}><span>Plantel</span><b>{plaNombre}</b></div>
                      <div className={s.kv}><span>Matrícula</span><b className={s.mono}>{alumno.matricula}</b></div>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {tab === 'PROYECCION' ? (
              <section className={s.panel}>
                <div className={s.panelTitleRow}>
                  <div className={s.panelTitle}>Proyección</div>
                  <div className={s.panelHint}>Todas las mensualidades del plan.</div>
                </div>

                <div className={s.list}>
                  {projection.map((p) => (
                    <div key={p.idx} className={s.listItem}>
                      <div className={s.listLeft}>
                        <div className={s.listTitle}>
                          <b>{p.concept}</b>
                          <span className={s.dot}>•</span>
                          <span className={s.mono}>{p.dueDate}</span>
                        </div>
                        <div className={s.listMeta}>
                          {p.status === 'PAGADO' ? (
                            <span className={`${s.tag} ${s.tagOk}`}>Pagado</span>
                          ) : (
                            <span className={`${s.tag} ${cmpISO(p.dueDate, todayISO()) < 0 ? s.tagWarn : s.tagIdle}`}>
                              {cmpISO(p.dueDate, todayISO()) < 0 ? 'Vencido' : 'Pendiente'}
                            </span>
                          )}
                          {p.method ? (
                            <>
                              <span className={s.dot}>•</span>
                              <span className={s.muted}>{p.method}</span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className={s.listRight}>
                        <b className={s.amount}>{formatMXN(p.amount)}</b>
                        {p.paymentId ? (
                          <button className={s.linkBtn} onClick={() => printReceipt(p.paymentId!)}>Comprobante</button>
                        ) : (
                          <button className={s.linkBtn} onClick={() => { setTab('PAGOS'); setPayDate(p.dueDate); }}>
                            Pagar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {tab === 'PAGOS' ? (
              <section className={s.panelGrid2}>
                {/* Registrar pago mensualidad */}
                <div className={s.panelCard}>
                  <div className={s.panelTitleRow}>
                    <div className={s.panelTitle}>Registrar pago</div>
                    <div className={s.panelHint}>Mensualidad del plan.</div>
                  </div>

                  <div className={s.formRow}>
                    <label className={s.label}>Fecha (mensualidad)</label>
                    <input className={s.input} type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                  </div>

                  <div className={s.formRow}>
                    <label className={s.label}>Método</label>
                    <select className={s.select} value={payMethod} onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}>
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TARJETA">Tarjeta</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                  </div>

                  <div className={s.formRow}>
                    <label className={s.label}>Monto</label>
                    <div className={s.readonlyBox}>
                      <b>{formatMXN(alumno.precioMensual)}</b>
                      <span className={s.muted}>mensual</span>
                    </div>
                  </div>

                  <button className={s.primaryBtn} onClick={addMensualidadPayment}>
                    Registrar pago
                  </button>

                  <div className={s.smallHint}>
                    Tip: si pagas una mensualidad futura, usa la fecha exacta de esa mensualidad.
                  </div>
                </div>

                {/* Historial */}
                <div className={s.panelCard}>
                  <div className={s.panelTitleRow}>
                    <div className={s.panelTitle}>Historial</div>
                    <div className={s.panelHint}>Pagos registrados y comprobantes.</div>
                  </div>

                  {alumnoPayments.length === 0 ? (
                    <div className={s.mutedBox}>Aún no hay pagos registrados.</div>
                  ) : (
                    <div className={s.historyList}>
                      {alumnoPayments.map((p) => (
                        <div key={p.id} className={s.historyRow}>
                          <div className={s.historyLeft}>
                            <div className={s.historyTitle}>
                              <b title={p.concept}>{p.concept}</b>
                              <span className={s.dot}>•</span>
                              <span className={s.mono}>{p.date}</span>
                            </div>

                            <div className={s.historyMeta}>
                              <span className={`${s.tag} ${p.status === 'PAGADO' ? s.tagOk : s.tagIdle}`}>
                                {p.status === 'PAGADO' ? 'Pagado' : 'Pendiente'}
                              </span>
                              <span className={s.dot}>•</span>
                              <span className={s.muted}>{p.method}</span>
                              <span className={s.dot}>•</span>
                              <span className={s.muted}>{p.type === 'MENSUALIDAD' ? 'Mensualidad' : 'Extra'}</span>
                            </div>
                          </div>

                          <div className={s.historyRight}>
                            <b className={s.amount}>{formatMXN(p.amount)}</b>
                            <div className={s.rowActions}>
                              <button className={s.linkBtn} onClick={() => printReceipt(p.id)}>Comprobante</button>
                              <button className={s.linkBtn} onClick={() => togglePaymentStatus(p.id)}>
                                {p.status === 'PAGADO' ? 'Marcar pendiente' : 'Marcar pagado'}
                              </button>
                              <button className={s.dangerBtn} onClick={() => removePayment(p.id)}>
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ) : null}

            {tab === 'EXTRAS' ? (
              <section className={s.panel}>
                <div className={s.panelTitleRow}>
                  <div className={s.panelTitle}>Pagos extra</div>
                  <div className={s.panelHint}>Cursos, conferencias, materiales, etc.</div>
                </div>

                <div className={s.extrasGrid}>
                  <div className={s.formRow}>
                    <label className={s.label}>Concepto</label>
                    <input className={s.input} value={extraConcept} onChange={(e) => setExtraConcept(e.target.value)} placeholder="Ej. Curso de verano" />
                  </div>

                  <div className={s.formRow}>
                    <label className={s.label}>Monto</label>
                    <input className={s.input} value={extraAmount} onChange={(e) => setExtraAmount(e.target.value)} inputMode="decimal" placeholder="0" />
                  </div>

                  <div className={s.formRow}>
                    <label className={s.label}>Fecha</label>
                    <input className={s.input} type="date" value={extraDate} onChange={(e) => setExtraDate(e.target.value)} />
                  </div>

                  <div className={s.formRow}>
                    <label className={s.label}>Método</label>
                    <select className={s.select} value={extraMethod} onChange={(e) => setExtraMethod(e.target.value as PaymentMethod)}>
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TARJETA">Tarjeta</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                  </div>
                </div>

                <button className={s.primaryBtn} onClick={addExtraPayment}>
                  Agregar pago extra
                </button>

                <div className={s.smallHint}>
                  Los extras se suman al total del plan y afectan el saldo automáticamente.
                </div>
              </section>
            ) : null}
          </div>
        )}
      </aside>
    </div>
  );
}
