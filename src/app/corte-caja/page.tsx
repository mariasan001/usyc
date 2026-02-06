// src/app/corte-caja/page.tsx
'use client';

import AppShell from '@/layout/AppShell/AppShell';
import s from './corte-caja.page.module.css';

import { useCorteCaja } from '@/modulos/corte-caja/hooks/useCorteCaja';
import CorteCajaFiltersBar from '@/modulos/corte-caja/ui/CorteCajaFiltersBar/CorteCajaFiltersBar';
import CorteCajaTableCard from '@/modulos/corte-caja/ui/CorteCajaTableCard/CorteCajaTableCard';
import { buildCorteCajaPdfBytes, downloadPdfBytes } from '@/modulos/corte-caja/utils/corteCajaPdf';


export default function CorteCajaPage() {
  const {
    loading,
    error,
    data,
    recibos,
    filters,
    setFilters,
    refresh,

    esAdmin,
    plantelUsuarioId,
    plantelUsuarioNombre,
  } = useCorteCaja();

  /**
   * ✅ Descarga PDF desde el FRONT (compatible con output:"export")
   * - No usa /api routes (porque en export no existen).
   * - Genera el PDF con la data actual.
   * - Usa `recibos` filtrados (lo que el usuario ve en pantalla).
   */
  async function onDownloadPdf() {
    if (!data) return;

    const plantelFinal = esAdmin ? filters.plantelId : plantelUsuarioId;

    const bytes = await buildCorteCajaPdfBytes({
      data,
      recibos,
      filters: {
        fechaInicio: filters.fechaInicio,
        fechaFin: filters.fechaFin,
        plantelId: plantelFinal,
      },
      plantelLabel: esAdmin ? null : plantelUsuarioNombre,
    });

    const filename = `corte-caja_${filters.fechaInicio}_a_${filters.fechaFin}.pdf`;
    downloadPdfBytes(bytes, filename);
  }

  return (
    <AppShell>
      <main className={s.page}>
        <header className={s.header}>
          <div className={s.title}>Reportes · Corte de caja</div>
          <div className={s.subtitle}>
            Corte de caja por día (fecha de pago) con desglose por tipo de pago.
          </div>
        </header>

        <section className={s.stack}>
          <CorteCajaFiltersBar
            filters={filters}
            onChange={setFilters}
            onRefresh={refresh}
            onDownloadPdf={onDownloadPdf} // ✅ NUEVO
            loading={loading}
            esAdmin={esAdmin}
            plantelUsuarioId={plantelUsuarioId}
            plantelUsuarioNombre={plantelUsuarioNombre}
          />

          <CorteCajaTableCard
            data={data}
            recibos={recibos}
            loading={loading}
            error={error}
          />
        </section>
      </main>
    </AppShell>
  );
}
