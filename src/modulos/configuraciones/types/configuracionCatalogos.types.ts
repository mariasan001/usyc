// src/modulos/configuraciones/pages/configuracion-catalogos/types/configuracionCatalogos.types.ts

import { CatalogKey } from "../ui/CatalogTabs/types/catalogoTabs.types";

/**
 * Shape mínimo que consume la tabla (catálogo genérico).
 * OJO: sigue siendo unknown para TS estricto sin usar any.
 */
export type CatalogRowLike = Record<string, unknown> & {
  id?: number | string;

  // español
  codigo?: string;
  nombre?: string;
  activo?: boolean;

  // carreras
  carreraId?: string;

  // conceptos pago
  conceptoId?: number;
  tipoMonto?: string;

  // swagger
  code?: string;
  name?: string;
  address?: string;
  active?: boolean;
};

/**
 * Estado del modal (abierto/cerrado).
 */
export type ModalState =
  | { open: false }
  | { open: true; mode: 'create' | 'edit'; catalog: CatalogKey; item?: unknown };

/**
 * Config “actual” según el tab seleccionado.
 * Deja a la page renderizar sin conocer detalles de cada hook.
 */
export type CurrentConfig = {
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
