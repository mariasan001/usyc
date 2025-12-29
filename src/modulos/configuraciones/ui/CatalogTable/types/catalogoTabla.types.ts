// src/modulos/configuraciones/ui/catalogo-tabla/types/catalogoTabla.types.ts

/**
 * Fila genérica para los catálogos.
 * - `unknown` permite TS estricto sin caer en any.
 * - Incluimos llaves conocidas para mejorar autocompletado y reglas de columnas.
 */
export type FilaCatalogo = Record<string, unknown> & {
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

  // carreras extras
  escolaridadNombre?: string;
  montoMensual?: number;
  montoInscripcion?: number;
  duracionAnios?: number;
  duracionMeses?: number;
};

/**
 * Props del componente de tabla.
 * - `onToggleActive` es opcional: si no viene, no se pinta el botón de power.
 */
export type CatalogoTablaProps = {
  title: string;
  items: FilaCatalogo[];

  isLoading?: boolean;
  isSaving?: boolean;
  error?: unknown;

  onReload: () => void;
  onEdit: (item: FilaCatalogo) => void;

  onToggleActive?: (item: FilaCatalogo) => void | Promise<void>;
  canToggleActive?: (item: FilaCatalogo) => boolean;
};
