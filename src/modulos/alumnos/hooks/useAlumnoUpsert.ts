'use client';

// src/modulos/alumnos/hooks/useAlumnoUpsert.ts
/**
 * Hook de formulario para:
 * - Crear alumno (POST /api/alumnos)
 * - Editar alumno (PUT /api/alumnos/update/{alumnoId})
 *
 * Objetivo:
 * - Centralizar carga (edit), draft controlado, validación UI y guardado.
 * - Mantener el componente AlumnoRegistroCard “tonto” (solo UI).
 *
 * Nota:
 * - La validación real la impone el backend.
 * - Aquí solo hacemos validación rápida para UX.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlumnosService } from '../services/alumnos.service';

import type { Alumno, AlumnoCreate, AlumnoUpdate } from '../types/alumno.types';

type Mode = 'create' | 'edit';

export type AlumnoUpsertDraft = {
  // comunes
  nombreCompleto: string;
  matricula: string;
  escolaridadId: number; // select
  carreraId: string;     // input/select controlado ('' permitido)
  plantelId: number;     // select
  fechaIngreso: string;  // YYYY-MM-DD
  fechaTermino: string;  // YYYY-MM-DD | '' (controlado)
  activo: boolean;

  // solo create (si tu UI lo usa)
  pullPrevReceipts: boolean;
  prevReceiptsNombre: string;
};

function trim(v: string) {
  return (v ?? '').trim();
}

function nonEmpty(v: string) {
  return trim(v).length > 0;
}

function isPositiveInt(n: unknown) {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

function emptyDraft(): AlumnoUpsertDraft {
  return {
    nombreCompleto: '',
    matricula: '',
    escolaridadId: 0,
    carreraId: '',
    plantelId: 0,
    fechaIngreso: '',
    fechaTermino: '',
    activo: true,

    pullPrevReceipts: false,
    prevReceiptsNombre: '',
  };
}

/** Mapea Alumno -> Draft (para modo edición) */
function alumnoToDraft(a: Alumno): AlumnoUpsertDraft {
  return {
    nombreCompleto: a.nombreCompleto ?? '',
    matricula: a.matricula ?? '',
    escolaridadId: a.escolaridadId ?? 0,
    carreraId: a.carreraId ?? '',
    plantelId: a.plantelId ?? 0,
    fechaIngreso: a.fechaIngreso ?? '',
    fechaTermino: a.fechaTermino ?? '',
    activo: !!a.activo,

    // create-only: en edit se apaga por defecto
    pullPrevReceipts: false,
    prevReceiptsNombre: '',
  };
}

/** Draft -> payload de UPDATE */
function draftToUpdatePayload(d: AlumnoUpsertDraft): AlumnoUpdate {
  return {
    nombreCompleto: trim(d.nombreCompleto),
    matricula: trim(d.matricula),

    escolaridadId: d.escolaridadId,
    // si viene '' lo mandamos null (backend suele agradecer)
    carreraId: trim(d.carreraId) ? trim(d.carreraId) : null,

    fechaIngreso: d.fechaIngreso,
    fechaTermino: trim(d.fechaTermino) ? d.fechaTermino : null,

    activo: !!d.activo,
    plantelId: d.plantelId,
  };
}

/** Draft -> payload de CREATE */
function draftToCreatePayload(d: AlumnoUpsertDraft): AlumnoCreate {
  return {
    nombreCompleto: trim(d.nombreCompleto),
    matricula: trim(d.matricula),

    escolaridadId: d.escolaridadId,
    carreraId: trim(d.carreraId) ? trim(d.carreraId) : undefined,

    fechaIngreso: d.fechaIngreso,
    plantelId: d.plantelId,

    // extras (si aplica en tu UI)
    pullPrevReceipts: !!d.pullPrevReceipts,
    prevReceiptsNombre: d.pullPrevReceipts ? trim(d.prevReceiptsNombre) : undefined,
  };
}

export function useAlumnoUpsert(opts?: { alumnoId?: string | null }) {
  const alumnoId = opts?.alumnoId ?? null;

  const mode = useMemo<Mode>(() => (alumnoId ? 'edit' : 'create'), [alumnoId]);

  const [draft, setDraft] = useState<AlumnoUpsertDraft>(() => emptyDraft());

  const [loading, setLoading] = useState(false); // cargar alumno (edit)
  const [saving, setSaving] = useState(false);  // guardar create/update
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const limpiarMensajes = useCallback(() => {
    setError(null);
    setOk(null);
  }, []);

  const setCampo = useCallback(<K extends keyof AlumnoUpsertDraft>(key: K, value: AlumnoUpsertDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Carga el alumno cuando hay alumnoId (modo edición) */
  const cargar = useCallback(async () => {
    if (!alumnoId) return;

    limpiarMensajes();
    setLoading(true);

    try {
      const alumno = await AlumnosService.getById(alumnoId);
      setDraft(alumnoToDraft(alumno));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo cargar el alumno.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [alumnoId, limpiarMensajes]);

  /** Resetea el draft (útil cuando sales del modo edición) */
  const reset = useCallback(() => {
    limpiarMensajes();
    setDraft(emptyDraft());
  }, [limpiarMensajes]);

  /** Validación UI rápida */
  const validar = useCallback(() => {
    if (!nonEmpty(draft.nombreCompleto)) throw new Error('Nombre completo es requerido.');
    if (!nonEmpty(draft.matricula)) throw new Error('Matrícula es requerida.');
    if (!isPositiveInt(draft.escolaridadId)) throw new Error('Selecciona una escolaridad válida.');
    if (!isPositiveInt(draft.plantelId)) throw new Error('Selecciona un plantel válido.');
    if (!nonEmpty(draft.fechaIngreso)) throw new Error('Fecha de ingreso es requerida.');

    // create-only
    if (mode === 'create' && draft.pullPrevReceipts && !nonEmpty(draft.prevReceiptsNombre)) {
      throw new Error('Si vas a migrar recibos previos, el nombre para búsqueda es requerido.');
    }
  }, [draft, mode]);

  /**
   * Guarda:
   * - create: POST
   * - edit: PUT update/{alumnoId}
   */
  const guardar = useCallback(async () => {
    limpiarMensajes();
    setSaving(true);

    try {
      validar();

      if (mode === 'edit') {
        if (!alumnoId) throw new Error('alumnoId faltante para edición.');
        const payload = draftToUpdatePayload(draft);
        const updated = await AlumnosService.update(alumnoId, payload);
        setOk('Alumno actualizado correctamente.');
        return updated;
      }

      // create
      const payload = draftToCreatePayload(draft);
      const created = await AlumnosService.create(payload);
      setOk('Alumno creado correctamente.');
      return created;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo guardar.';
      setError(msg);
      return null;
    } finally {
      setSaving(false);
    }
  }, [alumnoId, draft, limpiarMensajes, mode, validar]);

  // Auto-carga cuando entra alumnoId (edit)
  useEffect(() => {
    if (!alumnoId) {
      // si cambias de editar -> crear, limpia draft
      reset();
      return;
    }
    void cargar();
  }, [alumnoId, cargar, reset]);

  return {
    mode, // 'create' | 'edit'
    alumnoId,

    draft,
    setCampo,
    reset,

    loading,
    saving,

    error,
    ok,
    limpiarMensajes,

    cargar,   // por si quieres “reintentar”
    guardar,  // submit principal
  };
}
