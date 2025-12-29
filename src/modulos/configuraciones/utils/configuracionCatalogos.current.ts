// src/modulos/configuraciones/utils/configuracionCatalogos.current.ts
'use client';

import type { Dispatch, SetStateAction } from 'react';

import type { ModalState } from '@/modulos/configuraciones/types/configuracionCatalogos.types';

import type { Escolaridad } from '@/modulos/configuraciones/types/escolaridades.types';
import type { Carrera } from '@/modulos/configuraciones/types/carreras.types';
import type { ConceptoPago } from '@/modulos/configuraciones/types/conceptosPago.types';
import type { TipoPago, TipoPagoUpdate } from '@/modulos/configuraciones/types/tiposPago.types';
import type { Plantel } from '@/modulos/configuraciones/types/planteles.types';
import type { EstatusRecibo } from '@/modulos/configuraciones/types/estatusRecibo.types';
import { CatalogKey } from '../ui/CatalogTabs/types/catalogoTabs.types';

/**
 * Shape mínimo que consume la tabla.
 * Ojo: NO es el type real del backend; es el shape “amigable” que la UI sabe pintar.
 */
export type CatalogRowLike = Record<string, unknown> & {
  id?: number | string;
  codigo?: string;
  nombre?: string;
  activo?: boolean;

  // swagger
  code?: string;
  name?: string;
  address?: string;
  active?: boolean;

  // carreras
  carreraId?: string;

  // conceptos
  conceptoId?: number;
};

/**
 * Config que consume CatalogTable desde la page.
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

/**
 * Tipos “mínimos” (estructurales) de hooks.
 * - NO amarramos a implementaciones internas.
 * - Solo exigimos lo que necesitamos para armar la UI.
 */
type HookBase = {
  error?: unknown;
  reload: () => void;
};

type HookListadoConEstado = HookBase & {
  items: unknown[];
  isLoading?: boolean;
  isSaving?: boolean;
};

type HookListadoConEstadoAlterno = HookBase & {
  items: unknown[];
  loading?: boolean;
  saving?: boolean;
};

type EscolaridadesHook = HookListadoConEstado & {
  activar: (id: number) => Promise<unknown>;
  desactivar: (id: number) => Promise<unknown>;
};

type CarrerasHook = HookListadoConEstado & {
  activar: (carreraId: string) => Promise<unknown>;
  desactivar: (carreraId: string) => Promise<unknown>;
};

type ConceptosHook = HookListadoConEstado & {
  activar: (conceptoId: number) => Promise<unknown>;
  desactivar: (conceptoId: number) => Promise<unknown>;
};

type TiposPagoHook = HookListadoConEstado & {
  /**
   * Nota clave:
   * - Ya NO exigimos toggleActive aquí (porque tu hook no lo trae).
   * - El toggle lo resolvemos con update().
   */
  update: (id: number, payload: TipoPagoUpdate) => Promise<unknown>;
};

type PlantelesHook = HookListadoConEstadoAlterno & {
  remove: (id: number) => Promise<unknown>;
};

type EstatusHook = HookListadoConEstado & {};

type HooksPorCatalogo = {
  escolaridades: EscolaridadesHook;
  carreras: CarrerasHook;
  conceptos: ConceptosHook;
  tiposPago: TiposPagoHook;
  planteles: PlantelesHook;
  estatus: EstatusHook;
};

/**
 * Normaliza loading/saving (porque Planteles usa loading/saving
 * y el resto usa isLoading/isSaving).
 */
function leerLoading(h: HookListadoConEstado | HookListadoConEstadoAlterno): boolean | undefined {
  if ('isLoading' in h) return h.isLoading;
  if ('loading' in h) return h.loading;
  return undefined;
}

function leerSaving(h: HookListadoConEstado | HookListadoConEstadoAlterno): boolean | undefined {
  if ('isSaving' in h) return h.isSaving;
  if ('saving' in h) return h.saving;
  return undefined;
}

function toRows(items: unknown[]): CatalogRowLike[] {
  // la tabla es tolerante: solo necesita objetos.
  return items.filter((x): x is CatalogRowLike => x !== null && typeof x === 'object') as CatalogRowLike[];
}

/**
 * Construye la configuración “actual” según el tab.
 * - Mantiene el comportamiento original.
 * - No usa any.
 * - No exige props inexistentes (como toggleActive).
 */
export function construirConfigActual(params: {
  tab: CatalogKey;
  setModal: Dispatch<SetStateAction<ModalState>>;
  hooks: HooksPorCatalogo;
}): CurrentConfig {
  const { tab, setModal, hooks } = params;

  // ─────────────────────────────────────────────────────────────
  // ESCOLARIDADES
  // ─────────────────────────────────────────────────────────────
  if (tab === 'escolaridades') {
    const h = hooks.escolaridades;

    return {
      title: 'Escolaridades',
      items: toRows(h.items),
      isLoading: leerLoading(h),
      isSaving: leerSaving(h),
      error: h.error,
      onReload: h.reload,
      onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
      onEdit: (row) => setModal({ open: true, mode: 'edit', catalog: tab, item: row as Escolaridad }),
      onToggleActive: async (row) => {
        const item = row as Escolaridad;
        // Importante: devolvemos void (no propagamos “AsyncResult”)
        if (item.activo) await h.desactivar(item.id);
        else await h.activar(item.id);
      },
      canToggleActive: () => true,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // CARRERAS
  // ─────────────────────────────────────────────────────────────
  if (tab === 'carreras') {
    const h = hooks.carreras;

    return {
      title: 'Carreras',
      items: toRows(h.items),
      isLoading: leerLoading(h),
      isSaving: leerSaving(h),
      error: h.error,
      onReload: h.reload,
      onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
      onEdit: (row) => setModal({ open: true, mode: 'edit', catalog: tab, item: row as Carrera }),
      onToggleActive: async (row) => {
        const item = row as Carrera;
        if (item.activo) await h.desactivar(item.carreraId);
        else await h.activar(item.carreraId);
      },
      canToggleActive: () => true,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // CONCEPTOS DE PAGO
  // ─────────────────────────────────────────────────────────────
  if (tab === 'conceptosPago') {
    const h = hooks.conceptos;

    return {
      title: 'Conceptos de pago',
      items: toRows(h.items),
      isLoading: leerLoading(h),
      isSaving: leerSaving(h),
      error: h.error,
      onReload: h.reload,
      onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
      onEdit: (row) => setModal({ open: true, mode: 'edit', catalog: tab, item: row as ConceptoPago }),
      onToggleActive: async (row) => {
        const item = row as ConceptoPago;
        if (item.activo) await h.desactivar(item.conceptoId);
        else await h.activar(item.conceptoId);
      },
      canToggleActive: () => true,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // TIPOS DE PAGO (sin toggleActive en hook → resolvemos con update)
  // ─────────────────────────────────────────────────────────────
  if (tab === 'tiposPago') {
    const h = hooks.tiposPago;

    return {
      title: 'Tipos de pago',
      items: toRows(h.items),
      isLoading: leerLoading(h),
      isSaving: leerSaving(h),
      error: h.error,
      onReload: h.reload,
      onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
      onEdit: (row) => setModal({ open: true, mode: 'edit', catalog: tab, item: row as TipoPago }),
      onToggleActive: async (row) => {
        const item = row as TipoPago;

        // API esperada: PUT/PATCH con { name, active }
        const payload: TipoPagoUpdate = {
          name: item.name,
          active: !item.active,
        };

        await h.update(item.id, payload);
      },
      canToggleActive: () => true,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // PLANTELES (DELETE lógico)
  // ─────────────────────────────────────────────────────────────
  if (tab === 'planteles') {
    const h = hooks.planteles;

    return {
      title: 'Planteles',
      items: toRows(h.items),
      isLoading: leerLoading(h),
      isSaving: leerSaving(h),
      error: h.error,
      onReload: h.reload,
      onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
      onEdit: (row) => setModal({ open: true, mode: 'edit', catalog: tab, item: row as Plantel }),
      onToggleActive: async (row) => {
        const item = row as Plantel;

        // Regla original: solo permite “desactivar” si está activo
        if (!item.active) return;

        await h.remove(item.id);
      },
      canToggleActive: (row) => Boolean((row as Plantel).active),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // ESTATUS RECIBO (no toggle)
  // ─────────────────────────────────────────────────────────────
  const h = hooks.estatus;

  return {
    title: 'Estatus de recibo',
    items: toRows(h.items),
    isLoading: leerLoading(h),
    isSaving: leerSaving(h),
    error: h.error,
    onReload: h.reload,
    onCreate: () => setModal({ open: true, mode: 'create', catalog: tab }),
    onEdit: (row) => setModal({ open: true, mode: 'edit', catalog: tab, item: row as EstatusRecibo }),
    onToggleActive: undefined,
    canToggleActive: () => false,
  };
}
