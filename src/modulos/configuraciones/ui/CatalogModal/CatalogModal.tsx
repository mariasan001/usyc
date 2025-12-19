// src/modules/configuraciones/catalogos/ui/CatalogModal/CatalogModal.tsx
'use client';

import { useMemo, useState } from 'react';
import type { CatalogKey } from '../CatalogTabs/CatalogTabs';
import type { Escolaridad } from '@/modulos/configuraciones/types/escolaridades.types';
import s from './CatalogModal.module.css';

type Props = {
  catalog: CatalogKey;
  mode: 'create' | 'edit';
  initialValue?: any;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;

  // ✅ nuevo: opciones para el select
  escolaridadesOptions?: Escolaridad[];
};

export default function CatalogModal({
  catalog,
  mode,
  initialValue,
  isSaving,
  onClose,
  onSave,
  escolaridadesOptions = [],
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

  const escolaridadesSorted = useMemo(() => {
    return [...escolaridadesOptions].sort((a, b) =>
      (a.nombre ?? '').localeCompare(b.nombre ?? ''),
    );
  }, [escolaridadesOptions]);

  // form state
  const [form, setForm] = useState<any>(() => {
    if (catalog === 'escolaridades') {
      return {
        codigo: initialValue?.codigo ?? '',
        nombre: initialValue?.nombre ?? '',
        activo: initialValue?.activo ?? true,
      };
    }

    if (catalog === 'carreras') {
      // ✅ default: si es create y no hay escolaridadId, selecciona la primera escolaridad si existe
      const fallbackEscolaridadId =
        typeof initialValue?.escolaridadId === 'number'
          ? initialValue.escolaridadId
          : escolaridadesSorted[0]?.id ?? 0;

      return {
        carreraId: initialValue?.carreraId ?? '', // 👈 string "01"
        escolaridadId: fallbackEscolaridadId,
        nombre: initialValue?.nombre ?? '',
        montoMensual: initialValue?.montoMensual ?? 0,
        montoInscripcion: initialValue?.montoInscripcion ?? 0,
        duracionAnios: initialValue?.duracionAnios ?? 0,
        duracionMeses: initialValue?.duracionMeses ?? 0,
        activo: initialValue?.activo ?? true,
      };
    }

    // ✅ EstatusRecibo (NO tiene "activo" en tu API)
    return {
      codigo: initialValue?.codigo ?? '',
      nombre: initialValue?.nombre ?? '',
    };
  });

  function set<K extends string>(key: K, value: any) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    if (catalog === 'escolaridades') {
      const payload =
        mode === 'create'
          ? { codigo: String(form.codigo).trim(), nombre: String(form.nombre).trim(), activo: !!form.activo }
          : { nombre: String(form.nombre).trim(), activo: !!form.activo };
      await onSave(payload);
      return;
    }

    if (catalog === 'carreras') {
      const payload =
        mode === 'create'
          ? {
              carreraId: String(form.carreraId).trim(), // ✅ string
              escolaridadId: Number(form.escolaridadId), // ✅ id num
              nombre: String(form.nombre).trim(),
              montoMensual: Number(form.montoMensual),
              montoInscripcion: Number(form.montoInscripcion),
              duracionAnios: Number(form.duracionAnios),
              duracionMeses: Number(form.duracionMeses),
              activo: !!form.activo,
            }
          : {
              escolaridadId: Number(form.escolaridadId),
              nombre: String(form.nombre).trim(),
              montoMensual: Number(form.montoMensual),
              montoInscripcion: Number(form.montoInscripcion),
              duracionAnios: Number(form.duracionAnios),
              duracionMeses: Number(form.duracionMeses),
              activo: !!form.activo,
            };

      await onSave(payload);
      return;
    }

    // ✅ Estatus Recibo (create requiere codigo+nombre, update solo nombre según tu types)
    if (mode === 'create') {
      await onSave({
        codigo: String(form.codigo).trim(),
        nombre: String(form.nombre).trim(),
      });
    } else {
      await onSave({ nombre: String(form.nombre).trim() });
    }
  }

  const showCarreraId = catalog === 'carreras' && mode === 'create';
  const showEscolaridadSelect = catalog === 'carreras';
  const showActivo = catalog !== 'estatusRecibo'; // ✅ estatus no lleva activo

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
          {/* ESCOLARIDADES */}
          {catalog === 'escolaridades' && mode === 'create' && (
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

          {/* CARRERAS */}
          {showCarreraId && (
            <div className={s.field}>
              <label>Código de Carrera</label>
              <input
                value={form.carreraId}
                onChange={(e) => set('carreraId', e.target.value)}
                placeholder="01, 10…"
                required
              />
              <small className={s.help}>Es un string (tipo código). Ej: 01, 10.</small>
            </div>
          )}

          {showEscolaridadSelect && (
            <div className={s.field}>
              <label>Escolaridad</label>
              <select
                value={String(form.escolaridadId)}
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

          {/* ESTATUS RECIBO */}
          {catalog === 'estatusRecibo' && mode === 'create' && (
            <div className={s.field}>
              <label>Código</label>
              <input
                value={form.codigo}
                onChange={(e) => set('codigo', e.target.value)}
                placeholder="EMITIDO, PAGADO…"
                required
              />
            </div>
          )}

          {/* NOMBRE (común) */}
          <div className={s.field}>
            <label>Nombre</label>
            <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
          </div>

          {/* CAMPOS SOLO CARRERAS */}
          {catalog === 'carreras' && (
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

          {/* ACTIVO solo en escolaridades/carreras */}
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
