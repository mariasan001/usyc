// src/modulos/configuraciones/ui/catalogo-modal/utils/catalogoModal.titulo.ts
import type { CatalogKey } from '../../CatalogTabs/CatalogTabs';
import type { ModoModal } from '../types/catalogoModal.types';

/**
 * Devuelve el título del modal según el catálogo y el modo.
 * Mantiene esta lógica fuera del JSX para evitar ternarios largos.
 */
export function getTituloCatalogoModal(catalog: CatalogKey, mode: ModoModal): string {
  const nombre =
    catalog === 'escolaridades'
      ? 'Escolaridad'
      : catalog === 'carreras'
        ? 'Carrera'
        : catalog === 'conceptosPago'
          ? 'Concepto de Pago'
          : catalog === 'tiposPago'
            ? 'Tipo de pago'
            : catalog === 'planteles'
              ? 'Plantel'
              : 'Estatus Recibo';

  return mode === 'create' ? `Crear ${nombre}` : `Editar ${nombre}`;
}
