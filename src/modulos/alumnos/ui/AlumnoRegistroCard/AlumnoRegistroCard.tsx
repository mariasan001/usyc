'use client';

import { useCallback, useRef, useState } from 'react';
import s from './AlumnoRegistroCard.module.css';

import { useAlumnoForm } from '../../hooks/useAlumnoForm';

import EncabezadoRegistro from './partes/EncabezadoRegistro';
import AlertasRegistro from './partes/AlertasRegistro';
import CampoTexto from './partes/CampoTexto';
import SelectCatalogo from './partes/SelectCatalogo';
import MigracionRecibosPrevios from './partes/MigracionRecibosPrevios';
import AvisoRecibosPrevios from './partes/visoRecibosPrevios';
import VistaPreviaRegistro from './partes/vistaPreviaRegistro';

function formatearMXNEntero(n: number): string {
  return new Intl.NumberFormat('es-MX').format(Number.isFinite(n) ? n : 0);
}

export default function AlumnoRegistroCard() {
  const f = useAlumnoForm();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);

    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 2800);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const created = await f.submit();

      // Mensaje bonito sin depender de successFlash
      const msg =
        created && typeof created === 'object' && 'alumnoId' in created && created.alumnoId
          ? `Alumno creado: ${String(created.alumnoId)}`
          : 'Alumno creado ✅';

      showToast(msg);
    } catch {
      // el error ya lo pinta AlertasRegistro con f.formError
    }
  }, [f, showToast]);

  const placeholderPrograma = !f.escolaridadId
    ? 'Selecciona escolaridad…'
    : f.carrerasLoading
      ? 'Cargando…'
      : 'Selecciona…';

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
        precioMensualLabel="Precio mensual"
        precioMensualValor={`$${formatearMXNEntero(f.precioMensual || 0)}`}
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

        <AvisoRecibosPrevios
          s={s}
          nombre={f.nombreCompleto}
          loading={f.prevCountLoading}
          error={f.prevCountError}
          count={f.prevCount}
        />

        <SelectCatalogo
          s={s}
          full
          label="Escolaridad"
          value={f.escolaridadId ?? ''}
          onChange={(raw) => f.setEscolaridadId(raw ? Number(raw) : null)}
          disabled={f.escolaridadesLoading}
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
          disabled={f.plantelesLoading}
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
          disabled={!f.escolaridadId || f.carrerasLoading}
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

        <MigracionRecibosPrevios
          s={s}
          enabled={f.pullPrevReceipts}
          onToggle={f.setPullPrevReceipts}
          nombre={f.nombreCompleto}
          prevCount={f.prevCount}
        />
      </div>

      <VistaPreviaRegistro
        s={s}
        programaObligatorio={f.programaObligatorio}
        duracionMeses={f.duracionMeses}
        fechaTermino={f.fechaTermino}
      />

      <footer className={s.footer}>
        <button
          className={s.primaryBtn}
          disabled={f.submitting}
          onClick={handleSubmit}
          type="button"
        >
          {f.submitting ? 'Generando…' : 'Generar alumno'}
        </button>
      </footer>
    </section>
  );
}
