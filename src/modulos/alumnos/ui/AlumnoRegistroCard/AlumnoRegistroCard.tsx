// src/modulos/alumnos/ui/AlumnoRegistroCard/AlumnoRegistroCard.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import s from './AlumnoRegistroCard.module.css';

import { useAlumnoForm } from '../../hooks/useAlumnoForm';
import { AlumnosService } from '../../services/alumnos.service';

import type { Alumno, AlumnoUpdate } from '../../types/alumno.types';

import EncabezadoRegistro from './partes/EncabezadoRegistro';
import AlertasRegistro from './partes/AlertasRegistro';
import CampoTexto from './partes/CampoTexto';
import SelectCatalogo from './partes/SelectCatalogo';
import MigracionRecibosPrevios from './partes/MigracionRecibosPrevios';
import AvisoRecibosPrevios from './partes/visoRecibosPrevios';
import VistaPreviaRegistro from './partes/vistaPreviaRegistro';

type Props = {
  /** create = flujo actual, edit = reutiliza el mismo form para actualizar */
  mode?: 'create' | 'edit';

  /**
   * ✅ En edit (opción A): si ya tienes el objeto desde el row, pásalo aquí
   * (evitas pedir otro GET).
   */
  initialAlumno?: Alumno | null;

  /**
   * ✅ En edit (opción B): si solo guardas el alumnoId al dar click en “Editar”,
   * pásalo aquí y el componente hace GET /api/alumnos/{id} para precargar.
   */
  alumnoId?: string | null;

  /** Cuando guarda ok (ej. para volver a directorio y refrescar) */
  onDone?: () => void;

  /** Botón opcional para cancelar edición */
  onCancelEdit?: () => void;
};

function formatearMXNEntero(n: number): string {
  return new Intl.NumberFormat('es-MX').format(Number.isFinite(n) ? n : 0);
}

function nonEmpty(v: string) {
  return (v ?? '').trim().length > 0;
}

export default function AlumnoRegistroCard({
  mode = 'create',
  initialAlumno = null,
  alumnoId = null,
  onDone,
  onCancelEdit,
}: Props) {
  const f = useAlumnoForm();

  // ✅ Estado propio para edición (porque f.submitting solo aplica al create submit)
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 2800);
  }, []);

  // ✅ Fuente de verdad para precarga:
  // - Primero initialAlumno (si viene)
  // - Si no, pero hay alumnoId, hacemos GET y precargamos
  const effectiveAlumnoId = useMemo(() => {
    if (mode !== 'edit') return null;
    return initialAlumno?.alumnoId ?? alumnoId ?? null;
  }, [mode, initialAlumno?.alumnoId, alumnoId]);

  /**
   * ✅ Precarga del formulario en modo edición.
   * - Si llega initialAlumno: precarga directo.
   * - Si solo llega alumnoId: pedimos GET /api/alumnos/{id}.
   */
  useEffect(() => {
    if (mode !== 'edit') return;

    let cancelled = false;

    const fillForm = (a: Alumno) => {
      // setters del hook (controlado)
      f.setNombreCompleto(a.nombreCompleto ?? '');
      f.setMatricula(a.matricula ?? '');
      f.setEscolaridadId(Number.isFinite(a.escolaridadId) ? a.escolaridadId : null);
      f.setPlantelId(Number.isFinite(a.plantelId) ? a.plantelId : null);
      f.setCarreraId(a.carreraId ? String(a.carreraId) : null);
      f.setFechaIngreso(a.fechaIngreso ?? '');

      // En edición NO migramos recibos previos
      f.setPullPrevReceipts(false);

      // Si tu hook maneja fechaTermino internamente, perfecto.
      // Si existe setter, úsalo:
      // f.setFechaTermino?.(a.fechaTermino ?? '');
    };

    async function run() {
      // 1) Si ya tenemos el objeto completo: listo
      if (initialAlumno?.alumnoId) {
        fillForm(initialAlumno);
        return;
      }

      // 2) Si solo tenemos id: pedimos detalle
      if (!effectiveAlumnoId) return;

      setLoadingEdit(true);
      try {
        const res = await AlumnosService.getById(effectiveAlumnoId);
        if (cancelled) return;
        fillForm(res);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'No se pudo cargar el alumno.';
        showToast(msg);
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, effectiveAlumnoId, initialAlumno?.alumnoId]);

  const handleSubmit = useCallback(async () => {
    try {
      if (mode === 'edit') {
        if (!effectiveAlumnoId) {
          showToast('No se encontró alumnoId para editar.');
          return;
        }

        // Validación UI ligera (lo fuerte lo valida backend)
        if (!nonEmpty(f.nombreCompleto)) throw new Error('Nombre es requerido.');
        if (!nonEmpty(f.matricula)) throw new Error('Matrícula es requerida.');
        if (!Number.isFinite(f.escolaridadId ?? NaN)) throw new Error('Escolaridad es requerida.');
        if (!Number.isFinite(f.plantelId ?? NaN)) throw new Error('Plantel es requerido.');
        if (!nonEmpty(f.fechaIngreso)) throw new Error('Fecha de ingreso es requerida.');

        const payload: AlumnoUpdate = {
          nombreCompleto: f.nombreCompleto.trim(),
          matricula: f.matricula.trim(),
          escolaridadId: Number(f.escolaridadId),
          carreraId: f.carreraId ? String(f.carreraId) : null,
          fechaIngreso: f.fechaIngreso,
          fechaTermino: f.fechaTermino ? f.fechaTermino : null,

          // ✅ Si en tu UI no editas estado, mantenemos activo.
          // Si quieres permitir toggle, aquí conectas ese control.
          activo: true,

          plantelId: Number(f.plantelId),
        };

        setSavingEdit(true);
        await AlumnosService.update(effectiveAlumnoId, payload);
        showToast('Alumno actualizado ✅');
        onDone?.();
        return;
      }

      // create (flujo original)
      const created = await f.submit();

      const msg =
        created && typeof created === 'object' && 'alumnoId' in created && created.alumnoId
          ? `Alumno creado: ${String(created.alumnoId)}`
          : 'Alumno creado ✅';

      showToast(msg);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo guardar.';
      showToast(msg);
    } finally {
      setSavingEdit(false);
    }
  }, [mode, effectiveAlumnoId, f, onDone, showToast]);

  const placeholderPrograma = !f.escolaridadId
    ? 'Selecciona escolaridad…'
    : f.carrerasLoading
      ? 'Cargando…'
      : 'Selecciona…';

  const isBusy = f.submitting || loadingEdit || savingEdit;

  return (
    <section className={s.card}>
      {toastMsg ? (
        <div className={s.toast} role="status" aria-live="polite">
          <span className={s.toastDot} aria-hidden="true" />
          <span className={s.toastText}>{toastMsg}</span>
          <button className={s.toastClose} onClick={() => setToastMsg(null)} type="button">
            ✕
          </button>
        </div>
      ) : null}

      <EncabezadoRegistro
        s={s}
        precioMensualLabel={mode === 'edit' ? 'Editar alumno' : 'Precio mensual'}
        precioMensualValor={
          mode === 'edit' ? `ID: ${effectiveAlumnoId ?? '—'}` : `$${formatearMXNEntero(f.precioMensual || 0)}`
        }
      />

      <AlertasRegistro s={s} error={f.formError} ok={null} />

      <div className={s.grid}>
        <CampoTexto
          s={s}
          label="Nombre (APELLIDOS NOMBRES)"
          value={f.nombreCompleto}
          onChange={f.setNombreCompleto}
          placeholder="PÉREZ LÓPEZ JUAN CARLOS"
          autoComplete="name"
        />

        <CampoTexto
          s={s}
          label="Matrícula"
          value={f.matricula}
          onChange={f.setMatricula}
          placeholder="SYC-0003"
          autoComplete="off"
        />

        {/* ✅ Solo en create: recibos previos */}
        {mode === 'create' ? (
          <AvisoRecibosPrevios
            s={s}
            nombre={f.nombreCompleto}
            loading={f.prevCountLoading}
            error={f.prevCountError}
            count={f.prevCount}
          />
        ) : null}

        <SelectCatalogo
          s={s}
          full
          label="Escolaridad"
          value={f.escolaridadId ?? ''}
          onChange={(raw) => f.setEscolaridadId(raw ? Number(raw) : null)}
          disabled={f.escolaridadesLoading || isBusy}
          placeholder={f.escolaridadesLoading ? 'Cargando…' : 'Selecciona…'}
          errorText={f.escolaridadesError ? 'No se pudieron cargar escolaridades.' : null}
          options={f.escolaridades.map((x) => ({ value: String(x.id), label: x.nombre }))}
        />

        <SelectCatalogo
          s={s}
          full
          label="Plantel"
          value={f.plantelId ?? ''}
          onChange={(raw) => f.setPlantelId(raw ? Number(raw) : null)}
          disabled={f.plantelesLoading || isBusy}
          placeholder={f.plantelesLoading ? 'Cargando…' : 'Selecciona…'}
          errorText={f.plantelesError ? 'No se pudieron cargar planteles.' : null}
          options={f.planteles.map((p) => ({ value: String(p.id), label: p.name }))}
        />

        <SelectCatalogo
          s={s}
          label={
            <>
              {f.etiquetaPrograma} {f.programaObligatorio ? <span className={s.req}>*</span> : null}
            </>
          }
          value={f.carreraId ?? ''}
          onChange={(raw) => f.setCarreraId(raw || null)}
          disabled={!f.escolaridadId || f.carrerasLoading || isBusy}
          placeholder={placeholderPrograma}
          errorText={f.carrerasError ? 'No se pudieron cargar opciones.' : null}
          options={f.carrerasFiltradas.map((c) => ({ value: String(c.carreraId), label: c.nombre }))}
        />

        <CampoTexto
          s={s}
          label="Fecha de ingreso"
          type="date"
          value={f.fechaIngreso}
          onChange={f.setFechaIngreso}
        />

        {/* ✅ Solo en create: migración */}
        {mode === 'create' ? (
          <MigracionRecibosPrevios
            s={s}
            enabled={f.pullPrevReceipts}
            onToggle={f.setPullPrevReceipts}
            nombre={f.nombreCompleto}
            prevCount={f.prevCount}
          />
        ) : null}
      </div>

      <VistaPreviaRegistro
        s={s}
        programaObligatorio={f.programaObligatorio}
        duracionMeses={f.duracionMeses}
        fechaTermino={f.fechaTermino}
      />

      <footer className={s.footer}>
        {/* ✅ Cancelar edición (si el page lo manda) */}
        {mode === 'edit' && onCancelEdit ? (
          <button
            className={s.secondaryBtn}
            disabled={isBusy}
            onClick={onCancelEdit}
            type="button"
          >
            Cancelar
          </button>
        ) : null}

        <button className={s.primaryBtn} disabled={isBusy} onClick={handleSubmit} type="button">
          {isBusy
            ? mode === 'edit'
              ? 'Guardando…'
              : 'Generando…'
            : mode === 'edit'
              ? 'Guardar cambios'
              : 'Generar alumno'}
        </button>
      </footer>
    </section>
  );
}
