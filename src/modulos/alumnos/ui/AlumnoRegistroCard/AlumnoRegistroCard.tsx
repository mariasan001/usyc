// src/modulos/alumnos/ui/alumno-registro-card/AlumnoRegistroCard.tsx
'use client';

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
  // Mantiene el comportamiento: 1,200 (sin símbolo)
  return new Intl.NumberFormat('es-MX').format(Number.isFinite(n) ? n : 0);
}

/**
 * Card: Registro de alumno
 * - Componente 100% UI (composición).
 * - Toda la lógica vive en useAlumnoForm().
 * - Regla: SIEMPRE se elige un “programa” (campo `carreraId`),
 *   pero el label cambia: "Carrera" o "Nivel académico".
 * - Nombre: el hook lo normaliza y lo mantiene en MAYÚSCULAS.
 */
export default function AlumnoRegistroCard() {
  const f = useAlumnoForm();

  // Placeholder del selector de programa
  const placeholderPrograma = !f.escolaridadId
    ? 'Selecciona escolaridad…'
    : f.carrerasLoading
      ? 'Cargando…'
      : 'Selecciona…';

  return (
    <section className={s.card}>
      <EncabezadoRegistro
        s={s}
        precioMensualLabel="Precio mensual"
        precioMensualValor={`$${formatearMXNEntero(f.precioMensual || 0)}`}
      />

      <AlertasRegistro s={s} error={f.formError} ok={f.successFlash} />

      <div className={s.grid}>
        {/* 1) Nombre | Matrícula */}
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

        {/* Aviso recibos previos (por nombre) */}
        <AvisoRecibosPrevios
          s={s}
          nombre={f.nombreCompleto}
          loading={f.prevCountLoading}
          error={f.prevCountError}
          count={f.prevCount}
        />

        {/* 2) Escolaridad FULL */}
        <SelectCatalogo
          s={s}
          full
          label="Escolaridad"
          value={f.escolaridadId ?? ''}
          onChange={(raw) => f.setEscolaridadId(raw ? Number(raw) : null)}
          disabled={f.escolaridadesLoading}
          placeholder={f.escolaridadesLoading ? 'Cargando…' : 'Selecciona…'}
          errorText={f.escolaridadesError ? 'No se pudieron cargar escolaridades.' : null}
          options={f.escolaridades.map((x) => ({
            value: String(x.id),
            label: x.nombre,
          }))}
        />

        {/* 2) Plantel FULL */}
        <SelectCatalogo
          s={s}
          full
          label="Plantel"
          value={f.plantelId ?? ''}
          onChange={(raw) => f.setPlantelId(raw ? Number(raw) : null)}
          disabled={f.plantelesLoading}
          placeholder={f.plantelesLoading ? 'Cargando…' : 'Selecciona…'}
          errorText={f.plantelesError ? 'No se pudieron cargar planteles.' : null}
          options={f.planteles.map((p) => ({
            value: String(p.id),
            label: p.name,
          }))}
        />

        {/* 3) Programa (Carrera/Nivel) | Fecha ingreso */}
        <SelectCatalogo
          s={s}
          label={
            <>
              {f.etiquetaPrograma}{' '}
              {f.programaObligatorio ? <span className={s.req}>*</span> : null}
            </>
          }
          value={f.carreraId ?? ''}
          onChange={(raw) => f.setCarreraId(raw || null)}
          disabled={!f.escolaridadId || f.carrerasLoading}
          placeholder={placeholderPrograma}
          errorText={f.carrerasError ? 'No se pudieron cargar opciones.' : null}
          options={f.carrerasFiltradas.map((c) => ({
            value: String(c.carreraId),
            label: c.nombre,
          }))}
        />

        <CampoTexto
          s={s}
          label="Fecha de ingreso"
          type="date"
          value={f.fechaIngreso}
          onChange={f.setFechaIngreso}
        />

        {/* Migración de recibos previos */}
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
          onClick={f.submit}
          type="button"
        >
          {f.submitting ? 'Generando…' : 'Generar alumno'}
        </button>
      </footer>
    </section>
  );
}
