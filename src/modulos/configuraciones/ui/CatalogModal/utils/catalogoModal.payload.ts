// src/modulos/configuraciones/ui/catalogo-modal/utils/catalogoModal.payload.ts
import type { CatalogKey } from '../../CatalogTabs/CatalogTabs';
import type { FormState, ModoModal } from '../types/catalogoModal.types';
import { calcularTipoMontoConcepto } from './catalogoModal.tipoMonto';

/**
 * Convierte el estado del formulario al payload exacto que consume onSave,
 * replicando el comportamiento actual.
 *
 * Reglas:
 * - TRIM en strings
 * - Number(...) en numéricos
 * - Boolean con !!
 * - create/edit cambia campos (ej: codigo solo en create)
 */
export function buildPayloadCatalogo(args: {
  catalog: CatalogKey;
  mode: ModoModal;
  form: FormState;
}): unknown {
  const { catalog, mode, form } = args;

  // ✅ ESCOLARIDADES
  if (catalog === 'escolaridades') {
    return mode === 'create'
      ? {
          codigo: String(form.codigo ?? '').trim(),
          nombre: String(form.nombre ?? '').trim(),
        }
      : {
          nombre: String(form.nombre ?? '').trim(),
        };
  }

  // ✅ CARRERAS
  if (catalog === 'carreras') {
    return mode === 'create'
      ? {
          carreraId: String(form.carreraId ?? '').trim(),
          escolaridadId: Number(form.escolaridadId ?? 0),
          nombre: String(form.nombre ?? '').trim(),
          montoMensual: Number(form.montoMensual ?? 0),
          montoInscripcion: Number(form.montoInscripcion ?? 0),
          duracionAnios: Number(form.duracionAnios ?? 0),
          duracionMeses: Number(form.duracionMeses ?? 0),
          activo: !!form.activo,
        }
      : {
          escolaridadId: Number(form.escolaridadId ?? 0),
          nombre: String(form.nombre ?? '').trim(),
          montoMensual: Number(form.montoMensual ?? 0),
          montoInscripcion: Number(form.montoInscripcion ?? 0),
          duracionAnios: Number(form.duracionAnios ?? 0),
          duracionMeses: Number(form.duracionMeses ?? 0),
          activo: !!form.activo,
        };
  }

  // ✅ CONCEPTOS PAGO
    if (catalog === 'conceptosPago') {
    const codigo = String(form.codigo ?? '').trim().toUpperCase();
    const tipoMonto = calcularTipoMontoConcepto({
        codigo,
        nombre: form.nombre,
    });

    return mode === 'create'
        ? {
            codigo,
            nombre: String(form.nombre ?? '').trim(),
            descripcion: String(form.descripcion ?? '').trim(),
            tipoMonto,
            activo: !!form.activo,
        }
        : {
            nombre: String(form.nombre ?? '').trim(),
            descripcion: String(form.descripcion ?? '').trim(),
            tipoMonto,
            activo: !!form.activo,
        };
    }
  // ✅ TIPOS DE PAGO
  if (catalog === 'tiposPago') {
    return mode === 'create'
      ? {
          code: String(form.code ?? '').trim(),
          name: String(form.name ?? '').trim(),
          active: !!form.active,
        }
      : {
          name: String(form.name ?? '').trim(),
          active: !!form.active,
        };
  }

  // ✅ PLANTELES
  if (catalog === 'planteles') {
    return mode === 'create'
      ? {
          code: String(form.code ?? '').trim(),
          name: String(form.name ?? '').trim(),
          address: String(form.address ?? '').trim(),
          active: !!form.active,
        }
      : {
          name: String(form.name ?? '').trim(),
          address: String(form.address ?? '').trim(),
          active: !!form.active,
        };
  }

  // ✅ ESTATUS RECIBO
  if (catalog === 'estatusRecibo') {
    return mode === 'create'
      ? {
          codigo: String(form.codigo ?? '').trim(),
          nombre: String(form.nombre ?? '').trim(),
        }
      : {
          nombre: String(form.nombre ?? '').trim(),
        };
  }

  // Si algún día aparece un catálogo nuevo y no se mapea:
  // regresamos un objeto vacío para evitar romper runtime.
  return {};
}
