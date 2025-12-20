'use client';

import { useMemo, useState } from 'react';

import s from './ConfiguracionCatalogosPage.module.css';

import CatalogTabs, { CatalogKey } from '@/modulos/configuraciones/ui/CatalogTabs/CatalogTabs';
import CatalogTable from '@/modulos/configuraciones/ui/CatalogTable/CatalogTable';
import CatalogModal from '@/modulos/configuraciones/ui/CatalogModal/CatalogModal';

import { useCarreras, useEscolaridades } from '@/modulos/configuraciones/hooks';
import { useEstatusRecibo } from '@/modulos/configuraciones/hooks/useEstatusRecibo';
import { useConceptosPago } from '@/modulos/configuraciones/hooks/useConceptosPago';
import { useTiposPago } from '@/modulos/configuraciones/hooks/useTiposPago';
import { usePlanteles } from '@/modulos/configuraciones/hooks/usePlanteles';

import type {
  Escolaridad,
  EscolaridadCreate,
  EscolaridadUpdate,
} from '@/modulos/configuraciones/types/escolaridades.types';

import type {
  Carrera,
  CarreraCreate,
  CarreraUpdate,
} from '@/modulos/configuraciones/types/carreras.types';

import type {
  EstatusRecibo,
  EstatusReciboCreate,
  EstatusReciboUpdate,
} from '@/modulos/configuraciones/types/estatusRecibo.types';

import type {
  ConceptoPago,
  ConceptoPagoCreate,
  ConceptoPagoUpdate,
} from '@/modulos/configuraciones/types/conceptosPago.types';

import type {
  TipoPago,
  TipoPagoCreate,
  TipoPagoUpdate,
} from '@/modulos/configuraciones/types/tiposPago.types';

import type {
  Plantel,
  PlantelCreate,
  PlantelUpdate,
} from '@/modulos/configuraciones/types/planteles.types';

type ModalState =
  | { open: false }
  | { open: true; mode: 'create' | 'edit'; catalog: CatalogKey; item?: unknown };

export default function ConfiguracionCatalogosPage() {
  const [tab, setTab] = useState<CatalogKey>('escolaridades');
  const [soloActivos, setSoloActivos] = useState(true);

  const escolaridades = useEscolaridades({ soloActivos });
  const carreras = useCarreras({ soloActivos });
  const estatus = useEstatusRecibo({ soloActivos });
  const conceptos = useConceptosPago({ soloActivos });
  const tiposPago = useTiposPago({ soloActivos });
  const planteles = usePlanteles({ soloActivos });

  const [modal, setModal] = useState<ModalState>({ open: false });

  const current = useMemo(() => {
    if (tab === 'escolaridades') {
      return {
        title: 'Escolaridades',
        items: escolaridades.items,
        isLoading: escolaridades.isLoading,
        isSaving: escolaridades.isSaving,
        error: escolaridades.error,
        onReload: escolaridades.reload,
        onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
        onEdit: (item: Escolaridad) => setModal({ open: true, mode: 'edit', catalog: tab, item }),
        onToggleActive: (item: Escolaridad) =>
          item.activo ? escolaridades.desactivar(item.id) : escolaridades.activar(item.id),
      };
    }

    if (tab === 'carreras') {
      return {
        title: 'Carreras',
        items: carreras.items,
        isLoading: carreras.isLoading,
        isSaving: carreras.isSaving,
        error: carreras.error,
        onReload: carreras.reload,
        onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
        onEdit: (item: Carrera) => setModal({ open: true, mode: 'edit', catalog: tab, item }),
        onToggleActive: (item: Carrera) =>
          item.activo ? carreras.desactivar(item.carreraId) : carreras.activar(item.carreraId),
      };
    }

    if (tab === 'conceptosPago') {
      return {
        title: 'Conceptos de pago',
        items: conceptos.items,
        isLoading: conceptos.isLoading,
        isSaving: conceptos.isSaving,
        error: conceptos.error,
        onReload: conceptos.reload,
        onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
        onEdit: (item: ConceptoPago) =>
          setModal({ open: true, mode: 'edit', catalog: tab, item }),
        onToggleActive: (item: ConceptoPago) =>
          item.activo ? conceptos.desactivar(item.conceptoId) : conceptos.activar(item.conceptoId),
      };
    }

    if (tab === 'tiposPago') {
      return {
        title: 'Tipos de pago',
        items: tiposPago.items,
        isLoading: tiposPago.isLoading,
        isSaving: tiposPago.isSaving,
        error: tiposPago.error,
        onReload: tiposPago.reload,
        onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
        onEdit: (item: TipoPago) => setModal({ open: true, mode: 'edit', catalog: tab, item }),
        onToggleActive: (item: TipoPago) =>
          item.active ? tiposPago.desactivar(item.id) : tiposPago.activar(item.id),
      };
    }

    if (tab === 'planteles') {
      return {
        title: 'Planteles',
        items: planteles.items,
        isLoading: planteles.isLoading,
        isSaving: planteles.isSaving,
        error: planteles.error,
        onReload: planteles.reload,
        onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
        onEdit: (item: Plantel) => setModal({ open: true, mode: 'edit', catalog: tab, item }),
        onToggleActive: (item: Plantel) =>
          item.active ? planteles.desactivar(item.id) : planteles.activar(item.id),
      };
    }

    return {
      title: 'Estatus de recibo',
      items: estatus.items,
      isLoading: estatus.isLoading,
      isSaving: estatus.isSaving,
      error: estatus.error,
      onReload: estatus.reload,
      onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
      onEdit: (item: EstatusRecibo) => setModal({ open: true, mode: 'edit', catalog: tab, item }),
      onToggleActive: (item: EstatusRecibo) =>
        item.activo ? estatus.desactivar(item.id) : estatus.activar(item.id),
    };
  }, [tab, escolaridades, carreras, estatus, conceptos, tiposPago, planteles]);

  async function handleSave(payload: unknown) {
    if (!modal.open) return;

    if (modal.catalog === 'escolaridades') {
      modal.mode === 'create'
        ? await escolaridades.create(payload as EscolaridadCreate)
        : await escolaridades.update((modal.item as Escolaridad).id, payload as EscolaridadUpdate);
    }

    if (modal.catalog === 'carreras') {
      modal.mode === 'create'
        ? await carreras.create(payload as CarreraCreate)
        : await carreras.update((modal.item as Carrera).carreraId, payload as CarreraUpdate);
    }

    if (modal.catalog === 'conceptosPago') {
      modal.mode === 'create'
        ? await conceptos.create(payload as ConceptoPagoCreate)
        : await conceptos.update(
            (modal.item as ConceptoPago).conceptoId,
            payload as ConceptoPagoUpdate,
          );
    }

    if (modal.catalog === 'tiposPago') {
      modal.mode === 'create'
        ? await tiposPago.create(payload as TipoPagoCreate)
        : await tiposPago.update((modal.item as TipoPago).id, payload as TipoPagoUpdate);
    }

    if (modal.catalog === 'planteles') {
      modal.mode === 'create'
        ? await planteles.create(payload as PlantelCreate)
        : await planteles.update((modal.item as Plantel).id, payload as PlantelUpdate);
    }

    if (modal.catalog === 'estatusRecibo') {
      modal.mode === 'create'
        ? await estatus.create(payload as EstatusReciboCreate)
        : await estatus.update((modal.item as EstatusRecibo).id, payload as EstatusReciboUpdate);
    }

    setModal({ open: false });
  }

  return (
    <div className={s.page}>
      {/* ✅ Header compacto (tipo screenshot) */}
      <header className={s.topbar}>
        <div className={s.left}>
          
        </div>

        <div className={s.right}>
          <label className={s.onlyActive}>
            <input
              type="checkbox"
              checked={soloActivos}
              onChange={(e) => setSoloActivos(e.target.checked)}
            />
            <span>Solo activos</span>
          </label>

          <button className={s.primaryBtn} onClick={current.onCreate} type="button">
            + Nuevo
          </button>
        </div>
      </header>

      {/* ✅ Tabs arriba del card grande */}
      <div className={s.tabsRow}>
        <CatalogTabs value={tab} onChange={setTab} />
      </div>

      {/* ✅ Card grande conteniendo la tabla */}
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
