// src/modulos/configuraciones/utils/configuracionCatalogos.guardar.ts

import type { ModalState } from '@/modulos/configuraciones/types/configuracionCatalogos.types';

import type { Escolaridad, EscolaridadCreate, EscolaridadUpdate } from '@/modulos/configuraciones/types/escolaridades.types';
import type { Carrera, CarreraCreate, CarreraUpdate } from '@/modulos/configuraciones/types/carreras.types';
import type { ConceptoPago, ConceptoPagoCreate, ConceptoPagoUpdate } from '@/modulos/configuraciones/types/conceptosPago.types';
import type { TipoPago, TipoPagoCreate, TipoPagoUpdate } from '@/modulos/configuraciones/types/tiposPago.types';
import type { Plantel, PlantelCreate, PlantelUpdate } from '@/modulos/configuraciones/types/planteles.types';
import type { EstatusRecibo, EstatusReciboCreate, EstatusReciboUpdate } from '@/modulos/configuraciones/types/estatusRecibo.types';

/**
 * Acciones necesarias para guardar (create/update) por catálogo.
 * - No usamos any
 * - No requerimos retornos específicos (pueden devolver DTO o void)
 */
export type AccionesGuardarCatalogos = {
  escolaridades: {
    create: (p: EscolaridadCreate) => Promise<unknown>;
    update: (id: number, p: EscolaridadUpdate) => Promise<unknown>;
  };
  carreras: {
    create: (p: CarreraCreate) => Promise<unknown>;
    update: (id: string, p: CarreraUpdate) => Promise<unknown>;
  };
  conceptos: {
    create: (p: ConceptoPagoCreate) => Promise<unknown>;
    update: (id: number, p: ConceptoPagoUpdate) => Promise<unknown>;
  };
  tiposPago: {
    create: (p: TipoPagoCreate) => Promise<unknown>;
    update: (id: number, p: TipoPagoUpdate) => Promise<unknown>;
  };
  planteles: {
    create: (p: PlantelCreate) => Promise<unknown>;
    update: (id: number, p: PlantelUpdate) => Promise<unknown>;
  };
  estatus: {
    create: (p: EstatusReciboCreate) => Promise<unknown>;
    update: (id: number, p: EstatusReciboUpdate) => Promise<unknown>;
  };
};

/**
 * Ejecuta el guardado del modal de forma centralizada.
 * - Si el modal no está abierto, no hace nada.
 * - Si es create: usa create del catálogo.
 * - Si es edit: toma el id desde el item tipado del catálogo.
 */
export async function guardarCatalogo(args: {
  modal: ModalState;
  payload: unknown;
  acciones: AccionesGuardarCatalogos;
}): Promise<void> {
  const { modal, payload, acciones } = args;

  if (!modal.open) return;

  // ─────────────────────────────
  // CREATE
  // ─────────────────────────────
  if (modal.mode === 'create') {
    if (modal.catalog === 'escolaridades') {
      await acciones.escolaridades.create(payload as EscolaridadCreate);
      return;
    }
    if (modal.catalog === 'carreras') {
      await acciones.carreras.create(payload as CarreraCreate);
      return;
    }
    if (modal.catalog === 'conceptosPago') {
      await acciones.conceptos.create(payload as ConceptoPagoCreate);
      return;
    }
    if (modal.catalog === 'tiposPago') {
      await acciones.tiposPago.create(payload as TipoPagoCreate);
      return;
    }
    if (modal.catalog === 'planteles') {
      await acciones.planteles.create(payload as PlantelCreate);
      return;
    }
    if (modal.catalog === 'estatusRecibo') {
      await acciones.estatus.create(payload as EstatusReciboCreate);
      return;
    }
    return;
  }

  // ─────────────────────────────
  // EDIT (UPDATE)
  // ─────────────────────────────
  // Aquí, por diseño del ModalState actual, item es unknown,
  // así que lo tipamos por catálogo (sin any).
  if (modal.catalog === 'escolaridades') {
    const item = modal.item as Escolaridad;
    await acciones.escolaridades.update(item.id, payload as EscolaridadUpdate);
    return;
  }

  if (modal.catalog === 'carreras') {
    const item = modal.item as Carrera;
    await acciones.carreras.update(item.carreraId, payload as CarreraUpdate);
    return;
  }

  if (modal.catalog === 'conceptosPago') {
    const item = modal.item as ConceptoPago;
    await acciones.conceptos.update(item.conceptoId, payload as ConceptoPagoUpdate);
    return;
  }

  if (modal.catalog === 'tiposPago') {
    const item = modal.item as TipoPago;
    await acciones.tiposPago.update(item.id, payload as TipoPagoUpdate);
    return;
  }

  if (modal.catalog === 'planteles') {
    const item = modal.item as Plantel;
    await acciones.planteles.update(item.id, payload as PlantelUpdate);
    return;
  }

  if (modal.catalog === 'estatusRecibo') {
    const item = modal.item as EstatusRecibo;
    await acciones.estatus.update(item.id, payload as EstatusReciboUpdate);
  }
}
