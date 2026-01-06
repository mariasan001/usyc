'use client';

import AppShell from '@/layout/AppShell/AppShell';
import s from './corte-caja.page.module.css';

import { useCorteCaja } from '@/modulos/corte-caja/hooks/useCorteCaja';
import CorteCajaFiltersBar from '@/modulos/corte-caja/ui/CorteCajaFiltersBar/CorteCajaFiltersBar';
import CorteCajaTableCard from '@/modulos/corte-caja/ui/CorteCajaTableCard/CorteCajaTableCard';

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

  return (
      <AppShell>
    <main className={s.page}>
      <header className={s.header}>
        <div className={s.title}>Reportes · Corte de caja</div>
        <div className={s.subtitle}>Corte de caja por día (fecha de pago) con desglose por tipo de pago.</div>
      </header>

      <section className={s.stack}>
        <CorteCajaFiltersBar
          filters={filters}
          onChange={setFilters}
          onRefresh={refresh}
          loading={loading}
          esAdmin={esAdmin}
          plantelUsuarioId={plantelUsuarioId}
          plantelUsuarioNombre={plantelUsuarioNombre}
        />

        <CorteCajaTableCard data={data} recibos={recibos} loading={loading} error={error} />
      </section>
    </main>
    </AppShell>
  );
}
