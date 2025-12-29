// src/modulos/configuraciones/ui/catalogo-modal/CatalogoModal.tsx
"use client";

import { X, Save } from "lucide-react";

import s from "./CatalogModal.module.css";
import {
  calcularTipoMontoConcepto,
  etiquetarTipoMonto,
} from "./utils/catalogoModal.tipoMonto";
import type { CatalogoModalProps } from "./types/catalogoModal.types";
import InputMontoMXN from "./inputs/InputMontoMXN";
import { useCatalogoModal } from "./hook/useCatalogoModal";

/**
 * Modal genérico para Catálogos.
 * Importante:
 * - Este componente es principalmente UI.
 * - Toda la lógica por catálogo vive en el hook + utils.
 */
export default function CatalogoModal(props: CatalogoModalProps) {
  const { onClose, isSaving, catalog } = props;

  const { titulo, escolaridadesOrdenadas, form, setCampo, flags, submit } =
    useCatalogoModal(props);

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
          {/* CÓDIGO */}
          {flags.showCodigo && (
            <div className={s.field}>
              <label>Código</label>
              <input
                value={
                  flags.isTiposPago || flags.isPlanteles
                    ? String(form.code ?? "")
                    : String(form.codigo ?? "")
                }
                onChange={(e) =>
                  setCampo(
                    flags.isTiposPago || flags.isPlanteles ? "code" : "codigo",
                    e.target.value
                  )
                }
                placeholder={flags.placeholderCodigo}
                required
              />

              {catalog === "tiposPago" || catalog === "planteles" ? (
                <small className={s.help}>
                  Recomendado: MAYÚSCULAS y sin espacios.
                </small>
              ) : null}
            </div>
          )}

          {/* CARRERAS: carreraId */}
          {flags.showCarreraId && (
            <div className={s.field}>
              <label>Código de Carrera</label>
              <input
                value={String(form.carreraId ?? "")}
                onChange={(e) => setCampo("carreraId", e.target.value)}
                placeholder="01, 10…"
                required
              />
              <small className={s.help}>
                Es un string (tipo código). Ej: 01, 10.
              </small>
            </div>
          )}

          {/* CARRERAS: escolaridad select */}
          {flags.showEscolaridadSelect && (
            <div className={s.field}>
              <label>Escolaridad</label>
              <select
                value={String(form.escolaridadId ?? 0)}
                onChange={(e) =>
                  setCampo("escolaridadId", Number(e.target.value))
                }
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
              value={String(form[flags.nameKey] ?? "")}
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
                value={String(form.address ?? "")}
                onChange={(e) => setCampo("address", e.target.value)}
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
                value={String(form.descripcion ?? "")}
                onChange={(e) => setCampo("descripcion", e.target.value)}
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

          {/* CARRERAS: grid de montos y duración */}
          {catalog === "carreras" && (
            <div className={s.grid2}>
              <div className={s.field}>
                <label>Monto mensual</label>
                <InputMontoMXN
                  value={Number(form.montoMensual ?? 0)}
                  onChange={(n) => setCampo("montoMensual", n)}
                />
              </div>

              <div className={s.field}>
                <label>Monto inscripción</label>
                <InputMontoMXN
                  value={Number(form.montoInscripcion ?? 0)}
                  onChange={(n) => setCampo("montoInscripcion", n)}
                />
              </div>

              <div className={s.field}>
                <label>Duración (años)</label>
                <input
                  type="number"
                  value={Number(form.duracionAnios ?? 0)}
                  onChange={(e) =>
                    setCampo("duracionAnios", Number(e.target.value))
                  }
                />
              </div>

              <div className={s.field}>
                <label>Duración (meses)</label>
                <input
                  type="number"
                  value={Number(form.duracionMeses ?? 0)}
                  onChange={(e) =>
                    setCampo("duracionMeses", Number(e.target.value))
                  }
                />
              </div>
            </div>
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
              {isSaving ? "Guardando…" : "Guardar"}
            </button>
          </div>

          {/* Debug mínimo opcional (se puede quitar):
              <pre>{JSON.stringify({ catalog, mode, form }, null, 2)}</pre>
          */}
        </form>
      </div>
    </div>
  );
}
