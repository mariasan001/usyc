'use client';

import { useMemo, useState } from 'react';

import type { CatalogKey } from '../CatalogTabs/CatalogTabs';
import type { Escolaridad } from '@/modulos/configuraciones/types/escolaridades.types';

import s from './CatalogModal.module.css';

type Props = {
  catalog: CatalogKey;
  mode: 'create' | 'edit';
  initialValue?: unknown;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: unknown) => Promise<void>;

  // ✅ para select en carreras
  escolaridadesOptions?: Escolaridad[];
};

type FormState = Record<string, unknown>;

function asObj(v: unknown): Record<string, any> {
  if (v && typeof v === 'object') return v as any;
  return {};
}

export default function CatalogModal({
  catalog,
  mode,
  initialValue,
  isSaving,
  onClose,
  onSave,
  escolaridadesOptions = [],
}: Props) {
  const init = asObj(initialValue);

  const title = useMemo(() => {
    const name =
      catalog === 'escolaridades'
        ? 'Escolaridad'
        : catalog === 'carreras'
          ? 'Carrera'
          : catalog === 'conceptosPago'
            ? 'Concepto de Pago'
            : catalog === 'tiposPago'
              ? 'Tipo de pago'
              : 'Estatus Recibo';

    return mode === 'create' ? `Crear ${name}` : `Editar ${name}`;
  }, [catalog, mode]);

  const escolaridadesSorted = useMemo(() => {
    return [...escolaridadesOptions].sort((a, b) =>
      (a.nombre ?? '').localeCompare(b.nombre ?? ''),
    );
  }, [escolaridadesOptions]);

  const [form, setForm] = useState<FormState>(() => {
    // ESCOLARIDADES
    if (catalog === 'escolaridades') {
      return {
        codigo: init.codigo ?? '',
        nombre: init.nombre ?? '',
        activo: init.activo ?? true,
      };
    }

    // CARRERAS
    if (catalog === 'carreras') {
      const fallbackEscolaridadId =
        typeof init.escolaridadId === 'number'
          ? init.escolaridadId
          : escolaridadesSorted[0]?.id ?? 0;

      return {
        carreraId: init.carreraId ?? '',
        escolaridadId: fallbackEscolaridadId,
        nombre: init.nombre ?? '',
        montoMensual: init.montoMensual ?? 0,
        montoInscripcion: init.montoInscripcion ?? 0,
        duracionAnios: init.duracionAnios ?? 0,
        duracionMeses: init.duracionMeses ?? 0,
        activo: init.activo ?? true,
      };
    }

    // CONCEPTOS DE PAGO
    if (catalog === 'conceptosPago') {
      return {
        codigo: init.codigo ?? '',
        nombre: init.nombre ?? '',
        descripcion: init.descripcion ?? '',
        tipoMonto: init.tipoMonto ?? '',
        activo: init.activo ?? true,
      };
    }

    // ✅ TIPOS DE PAGO
    if (catalog === 'tiposPago') {
      return {
        code: init.code ?? '', // swagger: code
        name: init.name ?? '',
        active: init.active ?? true,
      };
    }

    // ESTATUS RECIBO
    return {
      codigo: init.codigo ?? '',
      nombre: init.nombre ?? '',
    };
  });

  function set<K extends string>(key: K, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // visibilidad de campos
  const showActivo = catalog !== 'estatusRecibo';

  const showCarreraId = catalog === 'carreras' && mode === 'create';
  const showEscolaridadSelect = catalog === 'carreras';

  const showConceptoCodigo = catalog === 'conceptosPago' && mode === 'create';
  const showConceptoDescripcion = catalog === 'conceptosPago';
  const showConceptoTipoMonto = catalog === 'conceptosPago';

  const showTipoPagoCode = catalog === 'tiposPago' && mode === 'create';

  const showCodigo =
    (catalog === 'escolaridades' && mode === 'create') ||
    (catalog === 'estatusRecibo' && mode === 'create') ||
    showConceptoCodigo ||
    showTipoPagoCode;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    // ESCOLARIDADES
    if (catalog === 'escolaridades') {
      const payload =
        mode === 'create'
          ? {
              codigo: String(form.codigo ?? '').trim(),
              nombre: String(form.nombre ?? '').trim(),
              activo: !!form.activo,
            }
          : {
              nombre: String(form.nombre ?? '').trim(),
              activo: !!form.activo,
            };
      await onSave(payload);
      return;
    }

    // CARRERAS
    if (catalog === 'carreras') {
      const payload =
        mode === 'create'
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

      await onSave(payload);
      return;
    }

    // CONCEPTOS PAGO
    if (catalog === 'conceptosPago') {
      const payload =
        mode === 'create'
          ? {
              codigo: String(form.codigo ?? '').trim(),
              nombre: String(form.nombre ?? '').trim(),
              descripcion: String(form.descripcion ?? '').trim(),
              tipoMonto: String(form.tipoMonto ?? '').trim(),
              activo: !!form.activo,
            }
          : {
              nombre: String(form.nombre ?? '').trim(),
              descripcion: String(form.descripcion ?? '').trim(),
              tipoMonto: String(form.tipoMonto ?? '').trim(),
              activo: !!form.activo,
            };

      await onSave(payload);
      return;
    }

    // ✅ TIPOS PAGO (swagger: code, name, active)
    if (catalog === 'tiposPago') {
      const payload =
        mode === 'create'
          ? {
              code: String(form.code ?? '').trim(),
              name: String(form.name ?? '').trim(),
              active: !!form.active,
            }
          : {
              name: String(form.name ?? '').trim(),
              active: !!form.active,
            };

      await onSave(payload);
      return;
    }

    // ESTATUS RECIBO
    if (mode === 'create') {
      await onSave({
        codigo: String(form.codigo ?? '').trim(),
        nombre: String(form.nombre ?? '').trim(),
      });
    } else {
      await onSave({
        nombre: String(form.nombre ?? '').trim(),
      });
    }
  }

  const isTiposPago = catalog === 'tiposPago';
  const nameKey = isTiposPago ? 'name' : 'nombre';
  const activeKey = isTiposPago ? 'active' : 'activo';

  return (
    <div className={s.backdrop} role="dialog" aria-modal="true">
      <div className={s.modal}>
        <div className={s.head}>
          <h3 className={s.h3}>{title}</h3>
          <button className={s.close} onClick={onClose} disabled={isSaving} type="button">
            ✕
          </button>
        </div>

        <form className={s.form} onSubmit={submit}>
          {/* CÓDIGO (según catálogo+modo) */}
          {showCodigo && (
            <div className={s.field}>
              <label>Código</label>
              <input
                value={
                  isTiposPago
                    ? String(form.code ?? '')
                    : String(form.codigo ?? '')
                }
                onChange={(e) =>
                  set(isTiposPago ? 'code' : 'codigo', e.target.value)
                }
                placeholder={
                  catalog === 'conceptosPago'
                    ? 'INSCRIPCION, MENSUALIDAD...'
                    : catalog === 'estatusRecibo'
                      ? 'EMITIDO, PAGADO...'
                      : catalog === 'tiposPago'
                        ? 'EFECTIVO, TARJETA...'
                        : 'SEC, LIC...'
                }
                required
              />
              {catalog === 'tiposPago' ? (
                <small className={s.help}>
                  Recomendado: MAYÚSCULAS y sin espacios.
                </small>
              ) : null}
            </div>
          )}

          {/* CARRERAS: carreraId */}
          {showCarreraId && (
            <div className={s.field}>
              <label>Código de Carrera</label>
              <input
                value={String(form.carreraId ?? '')}
                onChange={(e) => set('carreraId', e.target.value)}
                placeholder="01, 10…"
                required
              />
              <small className={s.help}>Es un string (tipo código). Ej: 01, 10.</small>
            </div>
          )}

          {/* CARRERAS: escolaridad select */}
          {showEscolaridadSelect && (
            <div className={s.field}>
              <label>Escolaridad</label>
              <select
                value={String(form.escolaridadId ?? 0)}
                onChange={(e) => set('escolaridadId', Number(e.target.value))}
                required
                disabled={!escolaridadesSorted.length}
              >
                {!escolaridadesSorted.length ? (
                  <option value="0">Cargando escolaridades…</option>
                ) : (
                  escolaridadesSorted.map((esc) => (
                    <option key={esc.id} value={esc.id}>
                      {esc.nombre} ({esc.codigo})
                    </option>
                  ))
                )}
              </select>
              <small className={s.help}>
                Se muestra el nombre, pero se envía el <b>ID</b>.
              </small>
            </div>
          )}

          {/* NOMBRE (común) */}
          <div className={s.field}>
            <label>Nombre</label>
            <input
              value={String(form[nameKey] ?? '')}
              onChange={(e) => set(nameKey, e.target.value)}
              required
            />
          </div>

          {/* CONCEPTOS PAGO: descripcion */}
          {showConceptoDescripcion && (
            <div className={s.field}>
              <label>Descripción</label>
              <textarea
                className={s.textarea}
                value={String(form.descripcion ?? '')}
                onChange={(e) => set('descripcion', e.target.value)}
                placeholder="Detalle del concepto…"
                rows={4}
              />
            </div>
          )}

          {/* CONCEPTOS PAGO: tipoMonto */}
          {showConceptoTipoMonto && (
            <div className={s.field}>
              <label>Tipo de monto</label>
              <input
                value={String(form.tipoMonto ?? '')}
                onChange={(e) => set('tipoMonto', e.target.value)}
                placeholder="FIJO, VARIABLE, PORCENTAJE…"
                required
              />
              <small className={s.help}>
                Si luego tenemos un catálogo cerrado, lo convertimos a select + union type.
              </small>
            </div>
          )}

          {/* CARRERAS: grid de montos y duración */}
          {catalog === 'carreras' && (
            <div className={s.grid2}>
              <div className={s.field}>
                <label>Monto mensual</label>
                <input
                  type="number"
                  value={String(form.montoMensual ?? 0)}
                  onChange={(e) => set('montoMensual', e.target.value)}
                />
              </div>

              <div className={s.field}>
                <label>Monto inscripción</label>
                <input
                  type="number"
                  value={String(form.montoInscripcion ?? 0)}
                  onChange={(e) => set('montoInscripcion', e.target.value)}
                />
              </div>

              <div className={s.field}>
                <label>Duración (años)</label>
                <input
                  type="number"
                  value={String(form.duracionAnios ?? 0)}
                  onChange={(e) => set('duracionAnios', e.target.value)}
                />
              </div>

              <div className={s.field}>
                <label>Duración (meses)</label>
                <input
                  type="number"
                  value={String(form.duracionMeses ?? 0)}
                  onChange={(e) => set('duracionMeses', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ACTIVO (todos menos estatusRecibo) */}
          {showActivo && (
            <label className={s.check}>
              <input
                type="checkbox"
                checked={!!form[activeKey]}
                onChange={(e) => set(activeKey, e.target.checked)}
              />
              Activo
            </label>
          )}

          <div className={s.footer}>
            <button type="button" className={s.secondary} onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className={s.primary} disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
