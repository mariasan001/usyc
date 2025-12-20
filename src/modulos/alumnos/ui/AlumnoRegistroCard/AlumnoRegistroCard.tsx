// src/modulos/alumnos/ui/AlumnoRegistroCard/AlumnoRegistroCard.tsx
'use client';

import s from './AlumnoRegistroCard.module.css';
import { useAlumnoForm } from '../../hooks/useAlumnoForm';

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX').format(Number.isFinite(n) ? n : 0);
}

export default function AlumnoRegistroCard() {
  const f = useAlumnoForm();

  return (
    <section className={s.card}>
      <header className={s.header}>
        <div className={s.headText}>
          <h2 className={s.title}>Registro de alumno</h2>
          <p className={s.subtitle}>
            Captura rápida + cálculo automático (término y precio).
          </p>
        </div>

        <div className={s.kpi}>
          <span className={s.kpiLabel}>Precio mensual</span>
          <span className={s.kpiValue}>${formatMXN(f.precioMensual || 0)}</span>
        </div>
      </header>

      {f.formError ? <div className={s.alertError}>{f.formError}</div> : null}
      {f.successFlash ? <div className={s.alertOk}>{f.successFlash}</div> : null}

      <div className={s.grid}>
        {/* 1) Nombre | Matrícula */}
        <div className={s.field}>
          <label className={s.label}>Nombre</label>
          <input
            className={s.input}
            value={f.nombreCompleto}
            onChange={(e) => f.setNombreCompleto(e.target.value)}
            placeholder="Nombre completo"
            autoComplete="name"
          />
        </div>

        <div className={s.field}>
          <label className={s.label}>Matrícula</label>
          <input
            className={s.input}
            value={f.matricula}
            onChange={(e) => f.setMatricula(e.target.value)}
            placeholder="SYC-0003"
            autoComplete="off"
          />
        </div>

        {/* 2) Escolaridad FULL */}
        <div className={`${s.field} ${s.full}`}>
          <label className={s.label}>Escolaridad</label>

          <select
            className={s.select}
            value={f.escolaridadId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              f.setEscolaridadId(v ? Number(v) : null);
            }}
            disabled={f.escolaridadesLoading}
          >
            <option value="">
              {f.escolaridadesLoading ? 'Cargando…' : 'Selecciona…'}
            </option>

            {f.escolaridades.map((x) => (
              <option key={x.id} value={String(x.id)}>
                {x.nombre}
              </option>
            ))}
          </select>

          {f.escolaridadesError ? (
            <div className={s.helperError}>
              No se pudieron cargar escolaridades.
            </div>
          ) : null}
        </div>

        {/* ✅ Plantel FULL */}
        <div className={`${s.field} ${s.full}`}>
          <label className={s.label}>Plantel</label>

          <select
            className={s.select}
            value={f.plantelId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              f.setPlantelId(v ? Number(v) : null);
            }}
            disabled={f.plantelesLoading}
          >
            <option value="">
              {f.plantelesLoading ? 'Cargando…' : 'Selecciona…'}
            </option>

            {f.planteles.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>

          {f.plantelesError ? (
            <div className={s.helperError}>No se pudieron cargar planteles.</div>
          ) : null}
        </div>

        {/* 3) Carrera | Fecha ingreso */}
        <div className={s.field}>
          <label className={s.label}>
            Carrera {f.carreraRequired ? <span className={s.req}>*</span> : null}
          </label>

          <select
            className={s.select}
            value={f.carreraId ?? ''}
            onChange={(e) => f.setCarreraId(e.target.value || null)}
            disabled={!f.carreraRequired || !f.escolaridadId || f.carrerasLoading}
          >
            <option value="">
              {!f.escolaridadId
                ? 'Selecciona escolaridad…'
                : !f.carreraRequired
                ? 'No aplica'
                : f.carrerasLoading
                ? 'Cargando…'
                : 'Selecciona…'}
            </option>

            {f.carrerasFiltradas.map((c) => (
              <option key={c.carreraId} value={String(c.carreraId)}>
                {c.nombre}
              </option>
            ))}
          </select>

          {f.carrerasError ? (
            <div className={s.helperError}>No se pudieron cargar carreras.</div>
          ) : null}
        </div>

        <div className={s.field}>
          <label className={s.label}>Fecha de ingreso</label>
          <input
            className={s.input}
            type="date"
            value={f.fechaIngreso}
            onChange={(e) => f.setFechaIngreso(e.target.value)}
          />
        </div>
      </div>

      <div className={s.preview}>
        <div className={s.previewItem}>
          <span className={s.previewLabel}>Duración</span>
          <span className={s.previewValue}>
            {f.carreraRequired ? `${f.duracionMeses} meses` : '—'}
          </span>
        </div>

        <div className={s.previewItem}>
          <span className={s.previewLabel}>Término</span>
          <span className={s.previewValue}>{f.fechaTermino}</span>
        </div>
      </div>

      <footer className={s.footer}>
        <button
          className={s.primaryBtn}
          disabled={f.submitting}
          onClick={f.submit}
          type="button"
        >
          {f.submitting ? 'Generando…' : 'Generar alumno'}
        </button>
      </footer>
    </section>
  );
}
