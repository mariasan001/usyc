// src/modulos/configuraciones/page.tsx
'use client';

import { useMemo, useState } from 'react';

import s from './ConfiguracionCatalogosPage.module.css';

import CatalogTabs, { CatalogKey } from '@/modulos/configuraciones/ui/CatalogTabs/CatalogTabs';
import CatalogTable from '@/modulos/configuraciones/ui/CatalogTable/CatalogTable';
import CatalogModal from '@/modulos/configuraciones/ui/CatalogModal/CatalogModal';

import { useCarreras, useEscolaridades } from '@/modulos/configuraciones/hooks';
import { useConceptosPago } from '@/modulos/configuraciones/hooks/useConceptosPago';
import { useTiposPago } from '@/modulos/configuraciones/hooks/useTiposPago';
import { usePlanteles } from '@/modulos/configuraciones/hooks/usePlanteles';
import { useEstatusRecibo } from '@/modulos/configuraciones/hooks/useEstatusRecibo';

import type { Escolaridad, EscolaridadCreate, EscolaridadUpdate } from '@/modulos/configuraciones/types/escolaridades.types';
import type { Carrera, CarreraCreate, CarreraUpdate } from '@/modulos/configuraciones/types/carreras.types';
import type { ConceptoPago, ConceptoPagoCreate, ConceptoPagoUpdate } from '@/modulos/configuraciones/types/conceptosPago.types';
import type { TipoPago, TipoPagoCreate, TipoPagoUpdate } from '@/modulos/configuraciones/types/tiposPago.types';
import type { Plantel, PlantelCreate, PlantelUpdate } from '@/modulos/configuraciones/types/planteles.types';
import type { EstatusRecibo, EstatusReciboCreate, EstatusReciboUpdate } from '@/modulos/configuraciones/types/estatusRecibo.types';

/** 👇 Importante: usar el mismo shape que espera CatalogTable */
type CatalogRowLike = Record<string, unknown> & {
  id?: number | string;
  codigo?: string;
  nombre?: string;
  activo?: boolean;
  carreraId?: string;
  conceptoId?: number;
  code?: string;
  name?: string;
  address?: string;
  active?: boolean;
};

type ModalState =
  | { open: false }
  | { open: true; mode: 'create' | 'edit'; catalog: CatalogKey; item?: unknown };

type CurrentConfig = {
  title: string;
  items: CatalogRowLike[];
  isLoading?: boolean;
  isSaving?: boolean;
  error?: unknown;
  onReload: () => void;
  onCreate: () => void;
  onEdit: (item: CatalogRowLike) => void;
  onToggleActive?: (item: CatalogRowLike) => void | Promise<void>;
  canToggleActive?: (item: CatalogRowLike) => boolean;
};

export default function ConfiguracionCatalogosPage() {
  const [tab, setTab] = useState<CatalogKey>('escolaridades');
  const [soloActivos, setSoloActivos] = useState(true);

  const escolaridades = useEscolaridades({ soloActivos });
  const carreras = useCarreras({ soloActivos });
  const conceptos = useConceptosPago({ soloActivos });
  const tiposPago = useTiposPago({ soloActivos });
  const planteles = usePlanteles({ soloActivos });
  const estatus = useEstatusRecibo();

  const [modal, setModal] = useState<ModalState>({ open: false });

  const current: CurrentConfig = useMemo(() => {
    if (tab === 'escolaridades') {
      return {
        title: 'Escolaridades',
        items: escolaridades.items as unknown as CatalogRowLike[],
        isLoading: escolaridades.isLoading,
        isSaving: escolaridades.isSaving,
        error: escolaridades.error,
        onReload: escolaridades.reload,
        onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
        onEdit: (row) => setModal({ open: true, mode: 'edit', catalog: tab, item: row as Escolaridad }),
        onToggleActive: (row) => {
          const item = row as Escolaridad;
          return item.activo ? escolaridades.desactivar(item.id) : escolaridades.activar(item.id);
        },
        canToggleActive: () => true,
      };
    }

    if (tab === 'carreras') {
      return {
        title: 'Carreras',
        items: carreras.items as unknown as CatalogRowLike[],
        isLoading: carreras.isLoading,
        isSaving: carreras.isSaving,
        error: carreras.error,
        onReload: carreras.reload,
        onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
        onEdit: (row) => setModal({ open: true, mode: 'edit', catalog: tab, item: row as Carrera }),
        onToggleActive: (row) => {
          const item = row as Carrera;
          return item.activo ? carreras.desactivar(item.carreraId) : carreras.activar(item.carreraId);
        },
        canToggleActive: () => true,
      };
    }

    if (tab === 'conceptosPago') {
      return {
        title: 'Conceptos de pago',
        items: conceptos.items as unknown as CatalogRowLike[],
        isLoading: conceptos.isLoading,
        isSaving: conceptos.isSaving,
        error: conceptos.error,
        onReload: conceptos.reload,
        onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
        onEdit: (row) => setModal({ open: true, mode: 'edit', catalog: tab, item: row as ConceptoPago }),
        onToggleActive: (row) => {
          const item = row as ConceptoPago;
          return item.activo ? conceptos.desactivar(item.conceptoId) : conceptos.activar(item.conceptoId);
        },
        canToggleActive: () => true,
      };
    }

    if (tab === 'tiposPago') {
      return {
        title: 'Tipos de pago',
        items: tiposPago.items as unknown as CatalogRowLike[],
        isLoading: tiposPago.isLoading,
        isSaving: tiposPago.isSaving,
        error: tiposPago.error,
        onReload: tiposPago.reload,
        onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
        onEdit: (row) => setModal({ open: true, mode: 'edit', catalog: tab, item: row as TipoPago }),

        // ✅ aquí ya no usamos desactivar/activar por id suelto
        // ✅ toggleActive hace PUT con {name, active}
        onToggleActive: (row) => tiposPago.toggleActive(row as TipoPago),

        // ✅ siempre puede, o si quieres ocultarlo cuando venga sin "active"
        canToggleActive: () => true,
      };
    }

    if (tab === 'planteles') {
      return {
        title: 'Planteles',
        items: planteles.items as unknown as CatalogRowLike[],
        isLoading: planteles.loading,
        isSaving: planteles.saving,
        error: planteles.error,
        onReload: planteles.reload,
        onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
        onEdit: (row) => setModal({ open: true, mode: 'edit', catalog: tab, item: row as Plantel }),

        // ✅ Planteles: DELETE = desactivar (borrado lógico)
        onToggleActive: (row) => {
          const item = row as Plantel;
          if (!item.active) return;
          return planteles.remove(item.id);
        },

        // ✅ Oculta el power si ya está inactivo
        canToggleActive: (row) => Boolean((row as Plantel).active),
      };
    }

    // ✅ ESTATUS RECIBO (sin active, sin delete)
    return {
      title: 'Estatus de recibo',
      items: estatus.items as unknown as CatalogRowLike[],
      isLoading: estatus.isLoading,
      isSaving: estatus.isSaving,
      error: estatus.error,
      onReload: estatus.reload,
      onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
      onEdit: (row) => setModal({ open: true, mode: 'edit', catalog: tab, item: row as EstatusRecibo }),
      onToggleActive: undefined,
      canToggleActive: () => false,
    };
  }, [tab, escolaridades, carreras, conceptos, tiposPago, planteles, estatus]);

  async function handleSave(payload: unknown) {
    if (!modal.open) return;

    if (modal.catalog === 'escolaridades') {
      if (modal.mode === 'create') await escolaridades.create(payload as EscolaridadCreate);
      else await escolaridades.update((modal.item as Escolaridad).id, payload as EscolaridadUpdate);
      setModal({ open: false });
      return;
    }

    if (modal.catalog === 'carreras') {
      if (modal.mode === 'create') await carreras.create(payload as CarreraCreate);
      else await carreras.update((modal.item as Carrera).carreraId, payload as CarreraUpdate);
      setModal({ open: false });
      return;
    }

    if (modal.catalog === 'conceptosPago') {
      if (modal.mode === 'create') await conceptos.create(payload as ConceptoPagoCreate);
      else await conceptos.update((modal.item as ConceptoPago).conceptoId, payload as ConceptoPagoUpdate);
      setModal({ open: false });
      return;
    }

    if (modal.catalog === 'tiposPago') {
      if (modal.mode === 'create') await tiposPago.create(payload as TipoPagoCreate);
      else await tiposPago.update((modal.item as TipoPago).id, payload as TipoPagoUpdate);
      setModal({ open: false });
      return;
    }

    if (modal.catalog === 'planteles') {
      if (modal.mode === 'create') await planteles.create(payload as PlantelCreate);
      else await planteles.update((modal.item as Plantel).id, payload as PlantelUpdate);
      setModal({ open: false });
      return;
    }

    if (modal.catalog === 'estatusRecibo') {
      if (modal.mode === 'create') await estatus.create(payload as EstatusReciboCreate);
      else await estatus.update((modal.item as EstatusRecibo).id, payload as EstatusReciboUpdate);
      setModal({ open: false });
      return;
    }

    setModal({ open: false });
  }

  const showSoloActivos = tab !== 'estatusRecibo';

  return (
    <div className={s.page}>
      <header className={s.topbar}>
        <div className={s.left} />
        <div className={s.right}>
          {showSoloActivos && (
            <label className={s.onlyActive}>
              <input
                type="checkbox"
                checked={soloActivos}
                onChange={(e) => setSoloActivos(e.target.checked)}
              />
              <span>Solo activos</span>
            </label>
          )}

          <button className={s.primaryBtn} onClick={current.onCreate} type="button">
            + Nuevo
          </button>
        </div>
      </header>

      <div className={s.tabsRow}>
        <CatalogTabs value={tab} onChange={setTab} />
      </div>

      <section className={s.card}>
        <CatalogTable
          title={current.title}
          items={current.items}
          isLoading={current.isLoading}
          isSaving={current.isSaving}
          error={current.error}
          onReload={current.onReload}
          onEdit={current.onEdit}
          onToggleActive={current.onToggleActive}
          canToggleActive={current.canToggleActive}
        />
      </section>

      {modal.open && (
        <CatalogModal
          catalog={modal.catalog}
          mode={modal.mode}
          initialValue={modal.item}
          escolaridadesOptions={escolaridades.items}
          isSaving={current.isSaving}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
