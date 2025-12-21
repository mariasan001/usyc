// src/app/alumnos/proyeccion/print/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type ProjectionRow = {
  idx: number;
  periodo: string;
  dueDate: string;
  conceptCode: string;
  amount: number;
  estado: string;
  isPaid?: boolean;
  reciboId?: number | null;
};

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    Number.isFinite(n) ? n : 0,
  );
}

export default function ProyeccionPrintPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const alumnoId = sp.get('alumnoId') ?? '';
  const [rows, setRows] = useState<ProjectionRow[] | null>(null);

  useEffect(() => {
    if (!alumnoId) return;

    try {
      const raw = sessionStorage.getItem(`projection:${alumnoId}`);
      if (!raw) {
        setRows([]);
        return;
      }
      setRows(JSON.parse(raw));
    } catch {
      setRows([]);
    }
  }, [alumnoId]);
  const summary = useMemo(() => {
    const r = rows ?? [];
    const pagados = r.filter((x) => !!x.isPaid).length;
    const pendientes = r.filter((x) => !x.isPaid).length;
    const total = r.reduce((acc, x) => acc + (Number(x.amount) || 0), 0);
    const totalPagado = r.reduce((acc, x) => acc + (x.isPaid ? (Number(x.amount) || 0) : 0), 0);
    const saldo = total - totalPagado;

    return { pagados, pendientes, total, totalPagado, saldo };
  }, [rows]);

  if (!alumnoId) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Falta alumnoId</h2>
      </div>
    );
  }

  if (rows === null) {
    return <div style={{ padding: 24 }}>Cargando…</div>;
  }

  if (rows.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No hay proyección para imprimir.</h2>
        <p>Vuelve al drawer y presiona “Exportar PDF”.</p>
        <button onClick={() => router.back()}>Volver</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Toolbar (no se imprime) */}
      <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button onClick={() => router.back()}>← Volver</button>
        <button onClick={() => window.print()}>Imprimir / Guardar PDF</button>
      </div>

      <h1 style={{ margin: 0 }}>Proyección de pagos</h1>
      <p style={{ marginTop: 6, color: '#667085' }}>Alumno: {alumnoId}</p>

      <div style={{ display: 'flex', gap: 12, margin: '14px 0 18px', flexWrap: 'wrap' }}>
        <div><b>Pagados:</b> {summary.pagados}</div>
        <div><b>Pendientes:</b> {summary.pendientes}</div>
        <div><b>Total:</b> {fmtMoney(summary.total)}</div>
        <div><b>Pagado:</b> {fmtMoney(summary.totalPagado)}</div>
        <div><b>Saldo:</b> {fmtMoney(summary.saldo)}</div>
      </div>

      <table width="100%" cellPadding={10} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #111827' }}>
            <th align="left">#</th>
            <th align="left">Periodo</th>
            <th align="left">Vence</th>
            <th align="left">Concepto</th>
            <th align="right">Monto</th>
            <th align="left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.periodo}_${r.idx}`} style={{ borderBottom: '1px solid #E5E7EB' }}>
              <td>{r.idx}</td>
              <td>{r.periodo}</td>
              <td>{r.dueDate}</td>
              <td>{r.conceptCode}</td>
              <td align="right">{fmtMoney(r.amount)}</td>
              <td>{r.isPaid ? 'Pagado' : r.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
