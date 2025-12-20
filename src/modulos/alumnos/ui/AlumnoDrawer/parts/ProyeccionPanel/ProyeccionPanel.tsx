// src/modulos/alumnos/ui/AlumnoDrawer/parts/ProyeccionPanel/ProyeccionPanel.tsx
'use client';

import s from './ProyeccionPanel.module.css';
import type { ProjectionRow } from '../../types/alumno-drawer.types';

function isRowPaid(r: ProjectionRow) {
  const estado = String((r as any).estado ?? '').toUpperCase();
  const estatusCodigo = String((r as any).estatusCodigo ?? '').toUpperCase();

  return (
    // 1) bandera “correcta”
    !!(r as any).isPaid ||
    // 2) cuando solo viene texto
    estado === 'PAGADO' ||
    estatusCodigo === 'PAGADO' ||
    // 3) si ya hay reciboId, ya está pagado sí o sí
    typeof (r as any).reciboId === 'number'
  );
}

export default function ProyeccionPanel({
  rows,
  onPay,
  onReceipt,
}: {
  rows: ProjectionRow[];
  onPay: (row: ProjectionRow) => void;
  onReceipt: (reciboId: number) => void;
}) {
  return (
    <section className={s.panel}>
      <header className={s.header}>
        <div>
          <div className={s.title}>Proyección</div>
          <div className={s.subtitle}>Calendario completo de pagos.</div>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className={s.empty}>Aún no hay proyección.</div>
      ) : (
        <div className={s.table}>
          <div className={s.trHead}>
            <div>#</div>
            <div>Periodo</div>
            <div>Vence</div>
            <div>Concepto</div>
            <div className={s.right}>Monto</div>
            <div>Estado</div>
            <div className={s.right}>Acción</div>
          </div>

          {rows.map((r) => {
            const key = `${r.periodo}_${r.idx}`;
            const paid = isRowPaid(r);

            // ✅ Si el back ya lo manda, úsalo
            const reciboId = (r as any).reciboId as number | undefined;

            return (
              <div className={s.tr} key={key}>
                <div>{r.idx}</div>
                <div className={s.mono}>{r.periodo}</div>
                <div className={s.mono}>{r.dueDate}</div>
                <div>{r.conceptCode}</div>
                <div className={`${s.mono} ${s.right}`}>${r.amount.toFixed(2)}</div>

                <div className={paid ? s.paid : s.pending}>
                  {paid ? 'Pagado' : (r as any).estado}
                </div>

                <div className={s.right}>
                  {paid ? (
                    <button
                      className={s.linkBtn}
                      type="button"
                      onClick={() => {
                        if (typeof reciboId !== 'number') {
                          // si llega aquí sin reciboId, es un bug de mapeo (del hook)
                          console.warn('[ProyeccionPanel] Pagado sin reciboId:', r);
                          return;
                        }
                        onReceipt(reciboId);
                      }}
                      disabled={typeof reciboId !== 'number'}
                      title={
                        typeof reciboId === 'number'
                          ? `Imprimir comprobante #${reciboId}`
                          : 'Falta reciboId (mapeo del back)'
                      }
                    >
                      Imprimir comprobante
                    </button>
                  ) : (
                    <button className={s.primaryBtn} type="button" onClick={() => onPay(r)}>
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
