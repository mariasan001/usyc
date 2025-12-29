// src/modulos/configuraciones/ui/catalogo-modal/utils/catalogoModal.formulario.ts
import type { CatalogKey } from '../../CatalogTabs/CatalogTabs';
import type { Escolaridad } from '@/modulos/configuraciones/types/escolaridades.types';
import type { FormState, ModoModal } from '../types/catalogoModal.types';

/**
 * Normaliza un "initialValue" desconocido a objeto para lectura segura.
 */
export function comoObjeto(v: unknown): Record<string, unknown> {
  if (v !== null && typeof v === 'object') return v as Record<string, unknown>;
  return {};
}

/**
 * Crea el estado inicial del formulario según catálogo y modo.
 * Importante: esta función SOLO define defaults.
 * No hace validación, no transforma payload, no toca UI.
 */
export function getFormularioInicial(args: {
  catalog: CatalogKey;
  mode: ModoModal;
  initialValue?: unknown;
  escolaridadesOrdenadas: Escolaridad[];
}): FormState {
  const init = comoObjeto(args.initialValue);
  const { catalog, mode, escolaridadesOrdenadas } = args;

  // ✅ ESCOLARIDADES
  if (catalog === 'escolaridades') {
    return {
      codigo: init.codigo ?? '',
      nombre: init.nombre ?? '',
    };
  }

  // ✅ CARRERAS
  if (catalog === 'carreras') {
    const fallbackEscolaridadId =
      typeof init.escolaridadId === 'number'
        ? init.escolaridadId
        : escolaridadesOrdenadas[0]?.id ?? 0;

    return {
      carreraId: init.carreraId ?? '',
      escolaridadId: fallbackEscolaridadId,
      nombre: init.nombre ?? '',
      montoMensual: Number(init.montoMensual ?? 0),
      montoInscripcion: Number(init.montoInscripcion ?? 0),
      duracionAnios: Number(init.duracionAnios ?? 0),
      duracionMeses: Number(init.duracionMeses ?? 0),
      activo: init.activo ?? true,
      __mode: mode, // útil para debug interno si algún día se requiere; opcional
    };
  }

  // ✅ CONCEPTOS DE PAGO
  if (catalog === 'conceptosPago') {
    return {
      codigo: init.codigo ?? '',
      nombre: init.nombre ?? '',
      descripcion: init.descripcion ?? '',
      tipoMonto: init.tipoMonto ?? '',
      activo: init.activo ?? true,
    };
  }

  // ✅ TIPOS DE PAGO (swagger: code, name, active)
  if (catalog === 'tiposPago') {
    return {
      code: init.code ?? '',
      name: init.name ?? '',
      active: init.active ?? true,
    };
  }

  // ✅ PLANTELES (swagger: code, name, address, active)
  if (catalog === 'planteles') {
    return {
      code: init.code ?? '',
      name: init.name ?? '',
      address: init.address ?? '',
      active: init.active ?? true,
    };
  }

  // ✅ ESTATUS RECIBO (swagger: id, codigo, nombre) -> SIN activo
  return {
    codigo: init.codigo ?? '',
    nombre: init.nombre ?? '',
  };
}
