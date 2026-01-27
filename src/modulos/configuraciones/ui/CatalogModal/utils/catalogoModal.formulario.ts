// src/modulos/configuraciones/ui/catalogo-modal/utils/catalogoModal.formulario.ts
import type { Escolaridad } from '@/modulos/configuraciones/types/escolaridades.types';
import type { FormState, ModoModal } from '../types/catalogoModal.types';
import { CatalogKey } from '../../CatalogTabs/types/catalogoTabs.types';

/**
 * Normaliza un "initialValue" desconocido a objeto para lectura segura.
 */
export function comoObjeto(v: unknown): Record<string, unknown> {
  if (v !== null && typeof v === 'object') return v as Record<string, unknown>;
  return {};
}

function asNumber(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asBoolean(v: unknown, fallback: boolean): boolean {
  if (typeof v === 'boolean') return v;
  return fallback;
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
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

  // ✅ CARRERAS (NUEVA ESTRUCTURA: conceptos[])
  if (catalog === 'carreras') {
    const fallbackEscolaridadId =
      typeof init.escolaridadId === 'number'
        ? init.escolaridadId
        : escolaridadesOrdenadas[0]?.id ?? 0;

    const conceptosRaw = Array.isArray(init.conceptos) ? init.conceptos : [];

    const conceptos = conceptosRaw.map((row) => {
      const r = comoObjeto(row);

      return {
        conceptoId: asNumber(r.conceptoId, 0),
        monto: asNumber(r.monto, 0),
        cantidad: asNumber(r.cantidad, 1),
        activo: asBoolean(r.activo, true),

        // solo UI (cuando viene de list/get)
        conceptoCodigo:
          typeof r.conceptoCodigo === 'string' ? r.conceptoCodigo : undefined,
        conceptoNombre:
          typeof r.conceptoNombre === 'string' ? r.conceptoNombre : undefined,
      };
    });

    return {
      carreraId: asString(init.carreraId, ''),
      escolaridadId: fallbackEscolaridadId,
      nombre: asString(init.nombre, ''),
      duracionAnios: asNumber(init.duracionAnios, 0),
      duracionMeses: asNumber(init.duracionMeses, 0),
      activo: asBoolean(init.activo, true),

      // 👇 nueva estructura
      conceptos: conceptos.length
        ? conceptos
        : [
            {
              conceptoId: 0,
              monto: 0,
              cantidad: 1,
              activo: true,
            },
          ],

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
