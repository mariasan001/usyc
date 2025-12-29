// src/modulos/configuraciones/page.tsx
'use client';

import { useMemo, useState } from 'react';

import s from './ConfiguracionCatalogosPage.module.css';


import CatalogTable from '@/modulos/configuraciones/ui/CatalogTable/CatalogTable';
import CatalogModal from '@/modulos/configuraciones/ui/CatalogModal/CatalogModal';

import { useCarreras, useEscolaridades } from '@/modulos/configuraciones/hooks';
import { useConceptosPago } from '@/modulos/configuraciones/hooks/useConceptosPago';
import { useTiposPago } from '@/modulos/configuraciones/hooks/useTiposPago';
import { usePlanteles } from '@/modulos/configuraciones/hooks/usePlanteles';
import { useEstatusRecibo } from '@/modulos/configuraciones/hooks/useEstatusRecibo';

import type { ModalState } from '@/modulos/configuraciones/types/configuracionCatalogos.types';

import { construirConfigActual } from '@/modulos/configuraciones/utils/configuracionCatalogos.current';
import { guardarCatalogo } from '@/modulos/configuraciones/utils/configuracionCatalogos.guardar';
import { CatalogKey } from './ui/CatalogTabs/types/catalogoTabs.types';
import CatalogoTabs from './ui/CatalogTabs/CatalogTabs';

/**
 * Page: Configuraciones → Catálogos
 * - Archivo “shell”: UI + estado mínimo.
 * - Lógica por catálogo: utils/configuracionCatalogos.current
 * - Guardado create/update: utils/configuracionCatalogos.guardar
 */
export default function ConfiguracionCatalogosPage() {
  const [tab, setTab] = useState<CatalogKey>('escolaridades');
  const [soloActivos, setSoloActivos] = useState(true);
  const [modal, setModal] = useState<ModalState>({ open: false });

  // Hooks (no se tocan)
  const escolaridades = useEscolaridades({ soloActivos });
  const carreras = useCarreras({ soloActivos });
  const conceptos = useConceptosPago({ soloActivos });
  const tiposPago = useTiposPago({ soloActivos });
  const planteles = usePlanteles({ soloActivos });
  const estatus = useEstatusRecibo();

  // Config actual según tab
  const current = useMemo(() => {
    return construirConfigActual({
      tab,
      setModal,
      hooks: { escolaridades, carreras, conceptos, tiposPago, planteles, estatus },
    });
  }, [tab, escolaridades, carreras, conceptos, tiposPago, planteles, estatus]);

  // Guardado central del modal
  async function handleSave(payload: unknown) {
    await guardarCatalogo({
      modal,
      payload,
      acciones: {
        escolaridades,
        carreras,
        conceptos,
        tiposPago,
        planteles,
        estatus,
      },
    });

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
        <CatalogoTabs value={tab} onChange={setTab} />
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
