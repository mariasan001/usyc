// src/modulos/configuraciones/ui/catalogo-modal/utils/catalogoModal.payload.ts
import { CatalogKey } from '../../CatalogTabs/types/catalogoTabs.types';
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
          codigo: String((form as Record<string, unknown>).codigo ?? '').trim(),
          nombre: String((form as Record<string, unknown>).nombre ?? '').trim(),
        }
      : {
          nombre: String((form as Record<string, unknown>).nombre ?? '').trim(),
        };
  }

  // ✅ CARRERAS (NUEVA ESTRUCTURA: conceptos[])
  if (catalog === 'carreras') {
    const f = form as Record<string, unknown>;

    // conceptos: [{ conceptoId, monto, cantidad, activo }]
    const conceptosRaw = Array.isArray(f.conceptos) ? (f.conceptos as unknown[]) : [];

    const conceptos = conceptosRaw
      .map((row) => {
        const r = row as Record<string, unknown>;

        const conceptoId = Number(r.conceptoId ?? 0);
        const monto = Number(r.monto ?? 0);
        const cantidad = Number(r.cantidad ?? 0);
        const activo = !!r.activo;

        return { conceptoId, monto, cantidad, activo };
      })
      // ✅ solo filas válidas (conceptoId > 0)
      .filter((x) => Number.isFinite(x.conceptoId) && x.conceptoId > 0)
      // ✅ normaliza números (evita NaN)
      .map((x) => ({
        ...x,
        monto: Number.isFinite(x.monto) ? x.monto : 0,
        cantidad: Number.isFinite(x.cantidad) ? x.cantidad : 0,
      }));

    return mode === 'create'
      ? {
          carreraId: String(f.carreraId ?? '').trim(),
          escolaridadId: Number(f.escolaridadId ?? 0),
          nombre: String(f.nombre ?? '').trim(),
          duracionAnios: Number(f.duracionAnios ?? 0),
          duracionMeses: Number(f.duracionMeses ?? 0),
          activo: !!f.activo,
          conceptos,
        }
      : {
          escolaridadId: Number(f.escolaridadId ?? 0),
          nombre: String(f.nombre ?? '').trim(),
          duracionAnios: Number(f.duracionAnios ?? 0),
          duracionMeses: Number(f.duracionMeses ?? 0),
          activo: !!f.activo,
          conceptos,
        };
  }

  // ✅ CONCEPTOS PAGO
  if (catalog === 'conceptosPago') {
    const f = form as Record<string, unknown>;
    const codigo = String(f.codigo ?? '').trim().toUpperCase();

    const tipoMonto = calcularTipoMontoConcepto({
      codigo,
      nombre: f.nombre,
    });

    return mode === 'create'
      ? {
          codigo,
          nombre: String(f.nombre ?? '').trim(),
          descripcion: String(f.descripcion ?? '').trim(),
          tipoMonto,
          activo: !!f.activo,
        }
      : {
          nombre: String(f.nombre ?? '').trim(),
          descripcion: String(f.descripcion ?? '').trim(),
          tipoMonto,
          activo: !!f.activo,
        };
  }

  // ✅ TIPOS DE PAGO
  if (catalog === 'tiposPago') {
    const f = form as Record<string, unknown>;
    return mode === 'create'
      ? {
          code: String(f.code ?? '').trim(),
          name: String(f.name ?? '').trim(),
          active: !!f.active,
        }
      : {
          name: String(f.name ?? '').trim(),
          active: !!f.active,
        };
  }

  // ✅ PLANTELES
  if (catalog === 'planteles') {
    const f = form as Record<string, unknown>;
    return mode === 'create'
      ? {
          code: String(f.code ?? '').trim(),
          name: String(f.name ?? '').trim(),
          address: String(f.address ?? '').trim(),
          active: !!f.active,
        }
      : {
          name: String(f.name ?? '').trim(),
          address: String(f.address ?? '').trim(),
          active: !!f.active,
        };
  }

  // ✅ ESTATUS RECIBO
  if (catalog === 'estatusRecibo') {
    const f = form as Record<string, unknown>;
    return mode === 'create'
      ? {
          codigo: String(f.codigo ?? '').trim(),
          nombre: String(f.nombre ?? '').trim(),
        }
      : {
          nombre: String(f.nombre ?? '').trim(),
        };
  }

  // Si algún día aparece un catálogo nuevo y no se mapea:
  // regresamos un objeto vacío para evitar romper runtime.
  return {};
}
