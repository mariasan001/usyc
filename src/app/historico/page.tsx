'use client';

import AppShell from '@/layout/AppShell/AppShell';

import s from './historico.page.module.css';

import { useHistorico } from '@/modulos/historico/hooks/useHistorico';
import HistoricoFiltersBar from '@/modulos/historico/ui/HistoricoFiltersBar/HistoricoFiltersBar';
import HistoricoTableCard from '@/modulos/historico/ui/HistoricoTableCard/HistoricoTableCard';

export default function HistoricoPage() {
  const h = useHistorico();

  return (
    <AppShell>
      <div className={s.page}>
        <div className={s.head}>
          <div>
            <h1 className={s.h1}>Históricos</h1>
            <p className={s.p}>Consulta general de recibos (según tu plantel o admin).</p>
          </div>

          <div className={s.totalPill}>{h.total} recibos</div>
        </div>

        <HistoricoFiltersBar
          filters={h.filters}
          onChange={h.setFilters}
          onRefresh={h.refresh}
          loading={h.loading}
        />

        <HistoricoTableCard items={h.items} loading={h.loading} error={h.error} />
      </div>
    </AppShell>
  );
}
