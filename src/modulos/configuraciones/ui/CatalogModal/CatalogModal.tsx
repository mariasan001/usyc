// src/modulos/configuraciones/ui/catalogo-modal/CatalogoModal.tsx
'use client';

import { X, Save } from 'lucide-react';

import s from './CatalogModal.module.css';
import {
  calcularTipoMontoConcepto,
  etiquetarTipoMonto,
} from './utils/catalogoModal.tipoMonto';
import type { CatalogoModalProps } from './types/catalogoModal.types';
import InputMontoMXN from './inputs/InputMontoMXN';
import { useCatalogoModal } from './hook/useCatalogoModal';

type CarreraConceptoRow = {
  conceptoId: number;
  monto: number;
  cantidad: number;
  activo: boolean;

  // solo UI (cuando viene de list/get)
  conceptoCodigo?: string;
  conceptoNombre?: string;
};

type ConceptoPagoOption = {
  conceptoId: number;
  codigo: string;
  nombre: string;
};

function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asBoolean(v: unknown, fallback = false): boolean {
  if (typeof v === 'boolean') return v;
  return fallback;
}

function getCarreraConceptos(form: Record<string, unknown>): CarreraConceptoRow[] {
  const raw = form.conceptos;

  if (!Array.isArray(raw)) return [];

  return raw.map((x) => {
    const obj = (x ?? {}) as Record<string, unknown>;

    return {
      conceptoId: asNumber(obj.conceptoId, 0),
      monto: asNumber(obj.monto, 0),
      cantidad: asNumber(obj.cantidad, 1),
      activo: asBoolean(obj.activo, true),
      conceptoCodigo:
        typeof obj.conceptoCodigo === 'string' ? obj.conceptoCodigo : undefined,
      conceptoNombre:
        typeof obj.conceptoNombre === 'string' ? obj.conceptoNombre : undefined,
    };
  });
}

function getConceptosPagoOptions(maybe: unknown): ConceptoPagoOption[] {
  if (!Array.isArray(maybe)) return [];

  return maybe
    .map((x) => {
      const obj = (x ?? {}) as Record<string, unknown>;
      const conceptoId = asNumber(obj.conceptoId, 0);
      const codigo = typeof obj.codigo === 'string' ? obj.codigo : '';
      const nombre = typeof obj.nombre === 'string' ? obj.nombre : '';

      return { conceptoId, codigo, nombre };
    })
    .filter((x) => Number.isFinite(x.conceptoId) && x.conceptoId > 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/**
 * Modal genérico para Catálogos.
 * Importante:
 * - Este componente es principalmente UI.
 * - Toda la lógica por catálogo vive en el hook + utils.
 *
 * Nota (Carreras):
 * - El campo "carreraId" se oculta en la UI.
 * - Si el backend lo requiere, debe generarse/inyectarse en el hook al hacer submit.
 */
export default function CatalogoModal(props: CatalogoModalProps) {
  const { onClose, isSaving, catalog } = props;

  // Nota:
  // Este hook puede (o no) exponer "conceptosPagoOrdenados". Para no romper
  // otros catálogos, lo leemos de forma segura.
  const hookResult = useCatalogoModal(props) as unknown as {
    titulo: string;
    escolaridadesOrdenadas: { id: number; nombre: string; codigo: string }[];
    form: Record<string, unknown>;
    setCampo: (key: string, value: unknown) => void;
    flags: {
      isTiposPago: boolean;
      isPlanteles: boolean;
      showCodigo: boolean;
      placeholderCodigo: string;
      showEscolaridadSelect: boolean;
      showPlantelAddress: boolean;
      showConceptoDescripcion: boolean;
      showActivo: boolean;
      nameKey: string;
      activeKey: string;
    };
    submit: (e: React.FormEvent) => Promise<void>;
    conceptosPagoOrdenados?: unknown;
  };

  const { titulo, escolaridadesOrdenadas, form, setCampo, flags, submit } =
    hookResult;

  // =========================
  // CARRERAS: conceptos (UI)
  // =========================
  const carreraConceptos = getCarreraConceptos(form);

  const conceptosPagoOptions = getConceptosPagoOptions(
    hookResult.conceptosPagoOrdenados,
  );

  function agregarConceptoCarrera() {
    const next: CarreraConceptoRow[] = [
      ...carreraConceptos,
      { conceptoId: 0, monto: 0, cantidad: 1, activo: true },
    ];
    setCampo('conceptos', next);
  }

  function eliminarConceptoCarrera(index: number) {
    const next = carreraConceptos.filter((_, i) => i !== index);
    setCampo('conceptos', next);
  }

  function actualizarConceptoCarrera(
    index: number,
    patch: Partial<CarreraConceptoRow>,
  ) {
    const next = carreraConceptos.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    );
    setCampo('conceptos', next);
  }

  // =========================
  // Scroll del modal:
  // - El contenido crece con conceptos y debe permitir scroll.
  // - Dejamos footer visible (sticky) sin tocar la estructura de otros catálogos.
  // =========================
  const bodyStyle: React.CSSProperties = {
    maxHeight: 'calc(100vh - 220px)',
    overflowY: 'auto',
    paddingRight: 4, // evita que el scrollbar tape contenido
  };

  return (
    <div className={s.backdrop} role="dialog" aria-modal="true">
      <div className={s.modal}>
        <div className={s.head}>
          <h3 className={s.h3}>{titulo}</h3>

          <button
            className={s.close}
            onClick={onClose}
            disabled={isSaving}
            type="button"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form className={s.form} onSubmit={submit}>
          {/* Contenido scrolleable (cuando crecen los conceptos) */}
          <div style={bodyStyle}>
            {/* CÓDIGO */}
            {flags.showCodigo && (
              <div className={s.field}>
                <label>Código</label>
                <input
                  value={
                    flags.isTiposPago || flags.isPlanteles
                      ? String(form.code ?? '')
                      : String(form.codigo ?? '')
                  }
                  onChange={(e) =>
                    setCampo(
                      flags.isTiposPago || flags.isPlanteles ? 'code' : 'codigo',
                      e.target.value,
                    )
                  }
                  placeholder={flags.placeholderCodigo}
                  required
                />

                {catalog === 'tiposPago' || catalog === 'planteles' ? (
                  <small className={s.help}>
                    Recomendado: MAYÚSCULAS y sin espacios.
                  </small>
                ) : null}
              </div>
            )}

            {/*
              ✅ CARRERAS: carreraId (OCULTO)
              - No se renderiza el input.
              - Se espera que el hook genere/inyecte carreraId en el submit.
            */}

            {/* CARRERAS: escolaridad select */}
            {flags.showEscolaridadSelect && (
              <div className={s.field}>
                <label>Escolaridad</label>
                <select
                  value={String(form.escolaridadId ?? 0)}
                  onChange={(e) => setCampo('escolaridadId', Number(e.target.value))}
                  required
                >
                  {escolaridadesOrdenadas.map((esc) => (
                    <option key={esc.id} value={esc.id}>
                      {esc.nombre} ({esc.codigo})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* NOMBRE */}
            <div className={s.field}>
              <label>Nombre</label>
              <input
                value={String(form[flags.nameKey] ?? '')}
                onChange={(e) => setCampo(flags.nameKey, e.target.value)}
                required
              />
            </div>

            {/* PLANTELES: address */}
            {flags.showPlantelAddress && (
              <div className={s.field}>
                <label>Dirección</label>
                <textarea
                  className={s.textarea}
                  value={String(form.address ?? '')}
                  onChange={(e) => setCampo('address', e.target.value)}
                  placeholder="Dirección del plantel…"
                  rows={3}
                />
              </div>
            )}

            {/* CONCEPTOS PAGO: descripcion */}
            {flags.showConceptoDescripcion && (
              <div className={s.field}>
                <label>Descripción</label>
                <textarea
                  className={s.textarea}
                  value={String(form.descripcion ?? '')}
                  onChange={(e) => setCampo('descripcion', e.target.value)}
                  placeholder="Detalle del concepto…"
                  rows={4}
                />
              </div>
            )}

            {/* CONCEPTOS PAGO: tipoMonto */}
            {catalog === 'conceptosPago' && (
              <div className={s.field}>
                <label>Tipo de monto</label>

                {(() => {
                  const tipoMontoReal = calcularTipoMontoConcepto({
                    codigo: form.codigo,
                    nombre: form.nombre,
                  });

                  return (
                    <>
                      <input value={etiquetarTipoMonto(tipoMontoReal)} disabled />
                      <small className={s.help}>
                        Se enviará como: <strong>{tipoMontoReal}</strong>
                      </small>
                    </>
                  );
                })()}
              </div>
            )}

            {/* CARRERAS: duración + conceptos */}
            {catalog === 'carreras' && (
              <>
                <div className={s.grid2}>
                  <div className={s.field}>
                    <label>Duración (años)</label>
                    <input
                      type="number"
                      value={Number(form.duracionAnios ?? 0)}
                      onChange={(e) =>
                        setCampo('duracionAnios', Number(e.target.value))
                      }
                      min={0}
                    />
                  </div>

                  <div className={s.field}>
                    <label>Duración (meses)</label>
                    <input
                      type="number"
                      value={Number(form.duracionMeses ?? 0)}
                      onChange={(e) =>
                        setCampo('duracionMeses', Number(e.target.value))
                      }
                      min={0}
                    />
                  </div>
                </div>

                <div className={s.field}>
                  <label>Conceptos</label>

                  {carreraConceptos.length === 0 ? (
                    <small className={s.help}>
                      Agrega los conceptos que aplican a esta carrera (por ejemplo:
                      inscripción, mensualidad, etc.).
                    </small>
                  ) : null}

                  <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
                    {carreraConceptos.map((row, i) => {
                      const selected = conceptosPagoOptions.find(
                        (x) => x.conceptoId === row.conceptoId,
                      );

                      return (
                        <div key={`concepto-${i}`} className={s.grid2}>
                          <div className={s.field}>
                            <label>ID Concepto</label>

                            {/* ✅ ahora es select (se elige desde catálogo de conceptos) */}
                            <select
                              value={String(row.conceptoId ?? 0)}
                              onChange={(e) =>
                                actualizarConceptoCarrera(i, {
                                  conceptoId: Number(e.target.value),
                                  // si quieres reflejar nombre/código en UI, lo guardamos aquí
                                  conceptoNombre: undefined,
                                  conceptoCodigo: undefined,
                                })
                              }
                              required
                            >
                              <option value="0" disabled>
                                Selecciona un concepto…
                              </option>

                              {conceptosPagoOptions.map((c) => (
                                <option key={c.conceptoId} value={c.conceptoId}>
                                  {c.nombre} ({c.codigo})
                                </option>
                              ))}
                            </select>

                            {selected ? (
                              <small className={s.help}>
                                {selected.nombre} · {selected.codigo}
                              </small>
                            ) : row.conceptoNombre || row.conceptoCodigo ? (
                              <small className={s.help}>
                                {row.conceptoNombre ? row.conceptoNombre : null}
                                {row.conceptoNombre && row.conceptoCodigo ? ' · ' : null}
                                {row.conceptoCodigo ? row.conceptoCodigo : null}
                              </small>
                            ) : null}
                          </div>

                          <div className={s.field}>
                            <label>Monto</label>
                            <InputMontoMXN
                              value={Number(row.monto ?? 0)}
                              onChange={(n) =>
                                actualizarConceptoCarrera(i, { monto: n })
                              }
                            />
                          </div>

                          <div className={s.field}>
                            <label>Cantidad</label>
                            <input
                              type="number"
                              value={Number(row.cantidad ?? 1)}
                              onChange={(e) =>
                                actualizarConceptoCarrera(i, {
                                  cantidad: Math.max(1, Number(e.target.value)),
                                })
                              }
                              min={1}
                            />
                          </div>

                          <div className={s.field} style={{ alignSelf: 'end' }}>
                            <label className={s.check} style={{ marginTop: 6 }}>
                              <input
                                type="checkbox"
                                checked={!!row.activo}
                                onChange={(e) =>
                                  actualizarConceptoCarrera(i, {
                                    activo: e.target.checked,
                                  })
                                }
                              />
                              Activo
                            </label>

                            <button
                              type="button"
                              className={s.secondary}
                              onClick={() => eliminarConceptoCarrera(i)}
                              disabled={isSaving}
                              style={{ marginTop: 8 }}
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className={s.secondary}
                    onClick={agregarConceptoCarrera}
                    disabled={isSaving}
                    style={{ marginTop: 10 }}
                  >
                    Agregar concepto
                  </button>
                </div>
              </>
            )}

            {/* ACTIVO */}
            {flags.showActivo && (
              <label className={s.check}>
                <input
                  type="checkbox"
                  checked={!!form[flags.activeKey]}
                  onChange={(e) => setCampo(flags.activeKey, e.target.checked)}
                />
                Activo
              </label>
            )}

            {/* Debug mínimo opcional (se puede quitar):
                <pre>{JSON.stringify({ catalog, mode, form }, null, 2)}</pre>
            */}
          </div>

          {/* Footer fuera del scroll (siempre visible) */}
          <div className={s.footer}>
            <button
              type="button"
              className={s.secondary}
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </button>

            <button type="submit" className={s.primary} disabled={isSaving}>
              <Save size={16} />
              {isSaving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
