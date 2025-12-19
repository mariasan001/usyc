'use client';

import s from './AlumnoRegistroCard.module.css';
import { useAlumnoForm } from '../../hooks/useAlumnoForm';
import type { AlumnoCreatePayload } from '../../types/alumnos.tipos';

type CreateAlumnoResult = unknown;

export default function AlumnoRegistroCard({
  onCreate,
}: {
  onCreate: (payload: AlumnoCreatePayload) => Promise<CreateAlumnoResult>;
}) {
  const f = useAlumnoForm(onCreate);

  return (
    <section className={s.card}>
      <header className={s.header}>
        <div className={s.headText}>
          <h2 className={s.title}>Registro de alumno</h2>
          <p className={s.subtitle}>Captura rápida + cálculo automático (término y precio).</p>
        </div>

        <div className={s.kpi}>
          <span className={s.kpiLabel}>Precio mensual</span>
          <span className={s.kpiValue}>${f.precioMensual.toLocaleString('es-MX')}</span>
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
      value={f.nombre}
      onChange={(e) => f.setNombre(e.target.value)}
      placeholder="Nombre completo"
    />
  </div>

  <div className={s.field}>
    <label className={s.label}>Matrícula</label>
    <input
      className={s.input}
      value={f.matricula}
      onChange={(e) => f.setMatricula(e.target.value)}
      placeholder="SYC-0003"
    />
  </div>

  {/* 2) Escolaridad FULL */}
  <div className={`${s.field} ${s.full}`}>
    <label className={s.label}>Escolaridad</label>
    <select
      className={s.select}
      value={f.escolaridadId}
      onChange={(e) => f.setEscolaridadId(e.target.value)}
    >
      {f.escolaridades.map((x) => (
        <option key={x.id} value={x.id}>
          {x.nombre}
        </option>
      ))}
    </select>
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
      disabled={!f.carreraRequired}
    >
      <option value="">{f.carreraRequired ? 'Selecciona…' : 'No aplica'}</option>
      {f.carreras.map((c) => (
        <option key={c.id} value={c.id}>
          {c.nombre}
        </option>
      ))}
    </select>
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

  {/* 4) Plantel FULL */}
  <div className={`${s.field} ${s.full}`}>
    <label className={s.label}>Plantel</label>
    <select
      className={s.select}
      value={f.plantelId}
      onChange={(e) => f.setPlantelId(e.target.value)}
    >
      {f.planteles.map((x) => (
        <option key={x.id} value={x.id}>
          {x.nombre}
        </option>
      ))}
    </select>
  </div>
</div>


      <div className={s.preview}>
        <div className={s.previewItem}>
          <span className={s.previewLabel}>Duración</span>
          <span className={s.previewValue}>{f.duracionMeses} meses</span>
        </div>
        <div className={s.previewItem}>
          <span className={s.previewLabel}>Término</span>
          <span className={s.previewValue}>{f.fechaTermino}</span>
        </div>
      </div>

      <footer className={s.footer}>
        <button className={s.primaryBtn} disabled={f.submitting} onClick={f.submit}>
          {f.submitting ? 'Generando…' : 'Generar alumno'}
        </button>

        <div className={s.hint}>
          Tip: cambia catálogos en <code>constants/</code> y todo se ajusta solo.
        </div>
      </footer>
    </section>
  );
}
