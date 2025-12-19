// src/modules/configuraciones/catalogos/page/ConfiguracionCatalogosPage.tsx
'use client';

import { useMemo, useState } from 'react';


import s from './ConfiguracionCatalogosPage.module.css';
import { useCarreras, useEscolaridades } from '@/modulos/configuraciones/hooks';
import { useEstatusRecibo } from '@/modulos/configuraciones/hooks/useEstatusRecibo';
import CatalogTabs, { CatalogKey } from '@/modulos/configuraciones/ui/CatalogTabs/CatalogTabs';
import CatalogTable from '@/modulos/configuraciones/ui/CatalogTable/CatalogTable';
import CatalogModal from '@/modulos/configuraciones/ui/CatalogModal/CatalogModal';
import { Escolaridad, EscolaridadCreate, EscolaridadUpdate } from '@/modulos/configuraciones/types/escolaridades.types';
import { Carrera, CarreraCreate, CarreraUpdate } from '@/modulos/configuraciones/types/carreras.types';
import { EstatusRecibo, EstatusReciboCreate, EstatusReciboUpdate } from '@/modulos/configuraciones/types/estatusRecibo.types';

type ModalState =
  | { open: false }
  | { open: true; mode: 'create' | 'edit'; catalog: CatalogKey; item?: any };

export default function ConfiguracionCatalogosPage() {
  const [tab, setTab] = useState<CatalogKey>('escolaridades');
  const [soloActivos, setSoloActivos] = useState(true);

  const escolaridades = useEscolaridades({ soloActivos });
  const carreras = useCarreras({ soloActivos }); // si luego filtras por escolaridadId, se setea params
  const estatus = useEstatusRecibo({ soloActivos });

  const [modal, setModal] = useState<ModalState>({ open: false });

  // 🔥 data “normalizada” para la tabla
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

    return {
      title: 'Estatus de Recibo',
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
  }, [tab, soloActivos, escolaridades, carreras, estatus]);

  async function handleSave(payload: any) {
    // modal.mode + modal.catalog definen qué llamar
    if (!modal.open) return;

    if (modal.catalog === 'escolaridades') {
      if (modal.mode === 'create') {
        await escolaridades.create(payload as EscolaridadCreate);
      } else {
        await escolaridades.update((modal.item as Escolaridad).id, payload as EscolaridadUpdate);
      }
    }

    if (modal.catalog === 'carreras') {
      if (modal.mode === 'create') {
        await carreras.create(payload as CarreraCreate);
      } else {
        await carreras.update((modal.item as Carrera).carreraId, payload as CarreraUpdate);
      }
    }

    if (modal.catalog === 'estatusRecibo') {
      if (modal.mode === 'create') {
        await estatus.create(payload as EstatusReciboCreate);
      } else {
        await estatus.update((modal.item as EstatusRecibo).id, payload as EstatusReciboUpdate);
      }
    }

    setModal({ open: false });
  }

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.titleBlock}>
          <h1 className={s.h1}>Configuración · Catálogos</h1>
          <p className={s.subtitle}>Administra escolaridades, carreras y estatus.</p>
        </div>

        <div className={s.actions}>
          <label className={s.toggle}>
            <input
              type="checkbox"
              checked={soloActivos}
              onChange={(e) => setSoloActivos(e.target.checked)}
            />
            <span>Solo activos</span>
          </label>

          <button className={s.primary} onClick={current.onCreate}>
            + Nuevo
          </button>
        </div>
      </header>

      <CatalogTabs value={tab} onChange={setTab} />

      <section className={s.content}>
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
    escolaridadesOptions={escolaridades.items} // ✅ para el select
    isSaving={
      modal.catalog === 'escolaridades'
        ? escolaridades.isSaving
        : modal.catalog === 'carreras'
        ? carreras.isSaving
        : estatus.isSaving
    }
    onClose={() => setModal({ open: false })}
    onSave={handleSave}
  />
)}

    </div>
  );
}
