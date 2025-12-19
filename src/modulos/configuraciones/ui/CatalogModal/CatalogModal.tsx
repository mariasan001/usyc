// src/modules/configuraciones/catalogos/ui/CatalogModal/CatalogModal.tsx
'use client';

import React, { useMemo, useState } from 'react';
import type { CatalogKey } from '../CatalogTabs/CatalogTabs';
import s from './CatalogModal.module.css';

type Props = {
  catalog: CatalogKey;
  mode: 'create' | 'edit';
  initialValue?: any;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
};

export default function CatalogModal({
  catalog,
  mode,
  initialValue,
  isSaving,
  onClose,
  onSave,
}: Props) {
  const title = useMemo(() => {
    const name =
      catalog === 'escolaridades'
        ? 'Escolaridad'
        : catalog === 'carreras'
        ? 'Carrera'
        : 'Estatus Recibo';
    return mode === 'create' ? `Crear ${name}` : `Editar ${name}`;
  }, [catalog, mode]);

  // ✅ helper: strings limpios
  const str = (v: any) => String(v ?? '').trim();

  // form state por catálogo (shape correcto)
  const [form, setForm] = useState<any>(() => {
    if (catalog === 'escolaridades') {
      return {
        codigo: str(initialValue?.codigo),
        nombre: str(initialValue?.nombre),
        // si tu back soporta activo aquí, ok:
        activo: initialValue?.activo ?? true,
      };
    }

    if (catalog === 'carreras') {
      return {
        carreraId: str(initialValue?.carreraId),
        escolaridadId: Number(initialValue?.escolaridadId ?? 0),
        nombre: str(initialValue?.nombre),
        montoMensual: Number(initialValue?.montoMensual ?? 0),
        montoInscripcion: Number(initialValue?.montoInscripcion ?? 0),
        duracionAnios: Number(initialValue?.duracionAnios ?? 0),
        duracionMeses: Number(initialValue?.duracionMeses ?? 0),
        // si tu back soporta activo aquí, ok:
        activo: initialValue?.activo ?? true,
      };
    }

    // ✅ estatusRecibo según swagger:
    // create: {codigo, nombre}
    // update: {nombre}
    return {
      codigo: str(initialValue?.codigo),
      nombre: str(initialValue?.nombre),
    };
  });

  function set<K extends string>(key: K, value: any) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // ✅ Escolaridades
    if (catalog === 'escolaridades') {
      const payload =
        mode === 'create'
          ? { codigo: str(form.codigo), nombre: str(form.nombre), activo: !!form.activo }
          : { nombre: str(form.nombre), activo: !!form.activo };

      await onSave(payload);
      return;
    }

    // ✅ Carreras
    if (catalog === 'carreras') {
      const payload =
        mode === 'create'
          ? {
              carreraId: str(form.carreraId),
              escolaridadId: Number(form.escolaridadId),
              nombre: str(form.nombre),
              montoMensual: Number(form.montoMensual),
              montoInscripcion: Number(form.montoInscripcion),
              duracionAnios: Number(form.duracionAnios),
              duracionMeses: Number(form.duracionMeses),
              activo: !!form.activo,
            }
          : {
              escolaridadId: Number(form.escolaridadId),
              nombre: str(form.nombre),
              montoMensual: Number(form.montoMensual),
              montoInscripcion: Number(form.montoInscripcion),
              duracionAnios: Number(form.duracionAnios),
              duracionMeses: Number(form.duracionMeses),
              activo: !!form.activo,
            };

      await onSave(payload);
      return;
    }

    // ✅ EstatusRecibo (AQUÍ estaba el bug: NO mandar activo)
    if (mode === 'create') {
      await onSave({ codigo: str(form.codigo), nombre: str(form.nombre) });
    } else {
      await onSave({ nombre: str(form.nombre) });
    }
  }

  const showActivo = catalog !== 'estatusRecibo'; // ✅ estatusRecibo no tiene activo en swagger
  const showCodigoEscolaridad = catalog === 'escolaridades' && mode === 'create';
  const showCarreraId = catalog === 'carreras' && mode === 'create';
  const showEscolaridadId = catalog === 'carreras';
  const showCarreraExtras = catalog === 'carreras';

  return (
    <div className={s.backdrop} role="dialog" aria-modal="true">
      <div className={s.modal}>
        <div className={s.head}>
          <h3 className={s.h3}>{title}</h3>
          <button className={s.close} onClick={onClose} disabled={isSaving} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <form className={s.form} onSubmit={submit}>
          {/* Escolaridades: codigo solo en create */}
          {showCodigoEscolaridad && (
            <div className={s.field}>
              <label>Código</label>
              <input
                value={form.codigo}
                onChange={(e) => set('codigo', e.target.value)}
                placeholder="SEC, BACH, LIC…"
                required
              />
            </div>
          )}

          {/* EstatusRecibo: codigo solo en create */}
          {catalog === 'estatusRecibo' && mode === 'create' && (
            <div className={s.field}>
              <label>Código</label>
              <input
                value={form.codigo}
                onChange={(e) => set('codigo', e.target.value)}
                placeholder="EMITIDO, PAGADO, CANCELADO…"
                required
              />
            </div>
          )}

          {/* Carreras: carreraId solo en create */}
          {showCarreraId && (
            <div className={s.field}>
              <label>ID Carrera</label>
              <input
                value={form.carreraId}
                onChange={(e) => set('carreraId', e.target.value)}
                placeholder="01, 10…"
                required
              />
            </div>
          )}

          {/* Carreras: escolaridadId siempre */}
          {showEscolaridadId && (
            <div className={s.field}>
              <label>Escolaridad ID</label>
              <input
                type="number"
                value={form.escolaridadId}
                onChange={(e) => set('escolaridadId', e.target.value)}
                required
              />
            </div>
          )}

          {/* Nombre (todos) */}
          <div className={s.field}>
            <label>Nombre</label>
            <input
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              required
            />
          </div>

          {/* Extras de carreras */}
          {showCarreraExtras && (
            <div className={s.grid2}>
              <div className={s.field}>
                <label>Monto mensual</label>
                <input
                  type="number"
                  value={form.montoMensual}
                  onChange={(e) => set('montoMensual', e.target.value)}
                />
              </div>

              <div className={s.field}>
                <label>Monto inscripción</label>
                <input
                  type="number"
                  value={form.montoInscripcion}
                  onChange={(e) => set('montoInscripcion', e.target.value)}
                />
              </div>

              <div className={s.field}>
                <label>Duración (años)</label>
                <input
                  type="number"
                  value={form.duracionAnios}
                  onChange={(e) => set('duracionAnios', e.target.value)}
                />
              </div>

              <div className={s.field}>
                <label>Duración (meses)</label>
                <input
                  type="number"
                  value={form.duracionMeses}
                  onChange={(e) => set('duracionMeses', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ✅ Activo solo para escolaridades/carreras */}
          {showActivo && (
            <label className={s.check}>
              <input
                type="checkbox"
                checked={!!form.activo}
                onChange={(e) => set('activo', e.target.checked)}
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
              {isSaving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
