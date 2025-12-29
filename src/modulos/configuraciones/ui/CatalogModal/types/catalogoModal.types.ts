// src/modulos/configuraciones/ui/catalogo-modal/types/catalogoModal.types.ts
import type { CatalogKey } from '../../CatalogTabs/CatalogTabs';
import type { Escolaridad } from '@/modulos/configuraciones/types/escolaridades.types';

/**
 * Estado genérico del formulario.
 * - Usamos unknown para mantener TypeScript estricto sin caer en any.
 * - Cada catálogo define qué llaves usa en utils (formulario/payload).
 */
export type FormState = Record<string, unknown>;

export type ModoModal = 'create' | 'edit';

export type CatalogoModalProps = {
  catalog: CatalogKey;
  mode: ModoModal;
  initialValue?: unknown;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: unknown) => Promise<void>;
  escolaridadesOptions?: Escolaridad[];
};

export type NombreCampoKey = 'name' | 'nombre';
export type ActivoCampoKey = 'active' | 'activo';

/**
 * Banderas que usa la UI para decidir qué campos renderizar.
 * Esto evita regar ifs por todo el JSX.
 */
export type FlagsCatalogoModal = {
  isTiposPago: boolean;
  isPlanteles: boolean;
  isEstatusRecibo: boolean;

  nameKey: NombreCampoKey;
  activeKey: ActivoCampoKey;

  showActivo: boolean;
  showCarreraId: boolean;
  showEscolaridadSelect: boolean;

  showConceptoCodigo: boolean;
  showConceptoDescripcion: boolean;
  showConceptoTipoMonto: boolean;

  showTipoPagoCode: boolean;

  showPlantelCode: boolean;
  showPlantelAddress: boolean;

  showCodigo: boolean;

  placeholderCodigo: string;
};
