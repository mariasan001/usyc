// src/modulos/configuraciones/ui/catalogo-tabs/types/catalogoTabs.types.ts

/**
 * Llaves oficiales de los catálogos disponibles.
 * Se mantiene en un archivo separado para reutilizarlo
 * en tablas, modales y servicios sin ciclos raros.
 */
export type CatalogKey =
  | 'escolaridades'
  | 'carreras'
  | 'planteles'
  | 'estatusRecibo'
  | 'conceptosPago'
  | 'tiposPago';

/**
 * Props del componente de pestañas.
 */
export type CatalogoTabsProps = {
  value: CatalogKey;
  onChange: (k: CatalogKey) => void;
};

/**
 * Tipo para cada tab.
 * - Icon es un componente React (Lucide).
 */
export type TabCatalogo = {
  key: CatalogKey;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};
