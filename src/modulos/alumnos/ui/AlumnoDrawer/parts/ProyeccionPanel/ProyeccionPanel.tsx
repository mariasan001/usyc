'use client';

import s from './ProyeccionPanel.module.css';
import type { ProjectionRow } from '../../types/alumno-drawer.types';

export default function ProyeccionPanel({
  rows,
  onPay,
  onReceipt,
  onExportPdf,
}: {
  rows: ProjectionRow[];
  onPay: (row: ProjectionRow) => void;

  // ✅ navega a /recibos/print?reciboId=...
  onReceipt: (reciboId: number) => void;

  // ✅ exportar proyección
  onExportPdf: () => void;
}) {
  return (
    <section className={s.panel}>
      <header className={s.header}>
        <div>
          <div className={s.title}>Proyección</div>
          <div className={s.subtitle}>Calendario completo de pagos.</div>
        </div>

        <div className={s.actions}>
          <button
            className={s.secondaryBtn}
            type="button"
            onClick={onExportPdf}
            title="Exportar la tabla de proyección a PDF"
          >
            Exportar PDF
          </button>
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

            const isPaid = !!r.isPaid;
            const hasReciboId =
              typeof r.reciboId === 'number' && r.reciboId > 0;

            return (
              <div className={s.tr} key={key}>
                <div>{r.idx}</div>
                <div className={s.mono}>{r.periodo}</div>
                <div className={s.mono}>{r.dueDate}</div>
                <div>{r.conceptCode}</div>

                <div className={`${s.mono} ${s.right}`}>
                  ${Number(r.amount ?? 0).toFixed(2)}
                </div>

                <div className={isPaid ? s.paid : s.pending}>
                  {isPaid ? 'Pagado' : (r.estado ?? 'Pendiente')}
                </div>

                <div className={s.right}>
                  {!isPaid ? (
                    <button
                      className={s.primaryBtn}
                      type="button"
                      onClick={() => onPay(r)}
                    >
                      Pagar
                    </button>
                  ) : hasReciboId ? (
                    <button
                      className={s.linkBtn}
                      type="button"
                      onClick={() => onReceipt(r.reciboId!)}
                      title={`Imprimir comprobante #${r.reciboId}`}
                    >
                      Imprimir
                    </button>
                  ) : (
                    <button
                      className={s.linkBtnDisabled}
                      type="button"
                      disabled
                      title="Pagado, pero falta reciboId para imprimir"
                    >
                      Imprimir
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
