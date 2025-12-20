// src/modulos/alumnos/hooks/useAlumnoForm.ts
'use client';

import { useCallback, useMemo, useState } from 'react';

import { useEscolaridades } from '@/modulos/configuraciones/hooks';
import { useCarreras } from '@/modulos/configuraciones/hooks';
import { useAlumnoCreate } from './useAlumnoCreate';

import type { Escolaridad } from '@/modulos/configuraciones/types/escolaridades.types';
import type { Carrera } from '@/modulos/configuraciones/types/carreras.types';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Helper: suma meses a YYYY-MM-DD (normaliza overflow como 31/feb)
function addMonthsISO(iso: string, months: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const base = new Date(y, (m - 1) + months, d);
  const daysInTargetMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const safe = new Date(base.getFullYear(), base.getMonth(), Math.min(d, daysInTargetMonth));
  return `${safe.getFullYear()}-${pad2(safe.getMonth() + 1)}-${pad2(safe.getDate())}`;
}

function normalize(s?: string | null) {
  return (s ?? '').trim().toLowerCase();
}

// Regla negocio: carrera NO aplica para primaria/secundaria/bachillerato
function computeCarreraRequired(esc?: Escolaridad | null) {
  const n = normalize(esc?.nombre);
  const c = normalize((esc as any)?.codigo); // por si tu type trae codigo
  const noAplica =
    n.includes('primaria') ||
    n.includes('secundaria') ||
    n.includes('bach') || // bachillerato / bach
    c === 'prim' ||
    c === 'sec' ||
    c === 'bach';

  return !noAplica;
}

export function useAlumnoForm() {
  // catálogos (API)
  const escolaridadesApi = useEscolaridades({ soloActivos: true });
  const carrerasApi = useCarreras({ soloActivos: true });

  // crear alumno (API)
  const alumnoCreate = useAlumnoCreate();

  // state del form (nombres como los usa tu AlumnoRegistroCard)
  const [nombre, setNombre] = useState('');
  const [matricula, setMatricula] = useState('');

  // ojo: en el <select> llega string
  const [escolaridadId, setEscolaridadIdState] = useState<string>('');
  const [carreraId, setCarreraId] = useState<string | null>(null);

  const [fechaIngreso, setFechaIngreso] = useState<string>(todayISO());

  // plantel (por ahora UI local; si luego hay catálogo, lo cambiamos igual)
  const planteles = useMemo(
    () => [
      { id: '1', nombre: 'Plantel 1' },
      { id: '2', nombre: 'Plantel 2' },
      { id: '3', nombre: 'Plantel 3' },
    ],
    [],
  );
  const [plantelId, setPlantelId] = useState<string>('1');

  const [formError, setFormError] = useState<string | null>(null);
  const [successFlash, setSuccessFlash] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // listas
  const escolaridades = useMemo(
    () => (escolaridadesApi.items ?? []) as Escolaridad[],
    [escolaridadesApi.items],
  );

  const escolaridadSel = useMemo(() => {
    const idNum = Number(escolaridadId);
    if (!idNum) return null;
    return escolaridades.find((e) => Number((e as any).id) === idNum) ?? null;
  }, [escolaridadId, escolaridades]);

  const carreraRequired = useMemo(
    () => computeCarreraRequired(escolaridadSel),
    [escolaridadSel],
  );

  // carreras filtradas por escolaridadId
  const carreras = useMemo(() => {
    const all = (carrerasApi.items ?? []) as Carrera[];
    const idNum = Number(escolaridadId);
    if (!idNum) return [];
    return all.filter((c) => Number((c as any).escolaridadId) === idNum);
  }, [carrerasApi.items, escolaridadId]);

  const carreraSel = useMemo(() => {
    if (!carreraId) return null;
    return carreras.find((c) => String((c as any).carreraId) === String(carreraId)) ?? null;
  }, [carreraId, carreras]);

  // cálculos (solo si aplica carrera)
  const precioMensual = useMemo(() => {
    if (!carreraRequired) return 0;
    return Number((carreraSel as any)?.montoMensual ?? 0);
  }, [carreraRequired, carreraSel]);

  const duracionMeses = useMemo(() => {
    if (!carreraRequired) return 0;
    const a = Number((carreraSel as any)?.duracionAnios ?? 0);
    const m = Number((carreraSel as any)?.duracionMeses ?? 0);
    return a * 12 + m;
  }, [carreraRequired, carreraSel]);

  const fechaTermino = useMemo(() => {
    if (!fechaIngreso) return '—';
    if (!carreraRequired) return '—';
    if (!duracionMeses) return '—';
    return addMonthsISO(fechaIngreso, duracionMeses);
  }, [fechaIngreso, duracionMeses, carreraRequired]);

  // setters “safe”
  const setEscolaridadId = useCallback((id: string) => {
    setEscolaridadIdState(id);

    // al cambiar escolaridad, resetea carrera siempre
    setCarreraId(null);
  }, []);

  const submit = useCallback(async () => {
    setFormError(null);
    setSuccessFlash(null);

    if (!nombre.trim()) return setFormError('Falta el nombre.');
    if (!matricula.trim()) return setFormError('Falta la matrícula.');
    if (!escolaridadId) return setFormError('Selecciona una escolaridad.');
    if (!fechaIngreso) return setFormError('Selecciona fecha de ingreso.');
    if (!plantelId) return setFormError('Selecciona un plantel.');

    // ✅ si aplica carrera, es obligatoria
    if (carreraRequired && !carreraId) return setFormError('Selecciona una carrera.');

    setSubmitting(true);
    try {
      // OJO: carreraId es string tipo "01"
      const payload = {
        nombre: nombre.trim(),
        matricula: matricula.trim(),
        escolaridadId: Number(escolaridadId),
        carreraId: carreraRequired ? String(carreraId) : null,
        fechaIngreso,
        plantelId: String(plantelId),
      };

      const created = await alumnoCreate.create(payload as any);

      // Ajusta el mensaje según lo que regrese tu API
      setSuccessFlash('Alumno creado correctamente ✅');
      return created;
    } catch (e: any) {
      setFormError(e?.message ?? 'No se pudo crear el alumno.');
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, [nombre, matricula, escolaridadId, carreraId, fechaIngreso, plantelId, carreraRequired, alumnoCreate]);

  return {
    // values
    nombre,
    matricula,
    escolaridadId,
    carreraId,
    fechaIngreso,
    plantelId,

    // setters
    setNombre,
    setMatricula,
    setEscolaridadId,
    setCarreraId,
    setFechaIngreso,
    setPlantelId,

    // catalogs
    escolaridades,
    carreras,

    // rule
    carreraRequired,

    // computed
    precioMensual,
    duracionMeses,
    fechaTermino,

    // ui state
    formError,
    successFlash,
    submitting,

    // actions
    submit,

    // planteles
    planteles,

    // loading/error por si quieres spinners
    escolaridadesLoading: escolaridadesApi.isLoading,
    carrerasLoading: carrerasApi.isLoading,
    escolaridadesError: escolaridadesApi.error,
    carrerasError: carrerasApi.error,
  };
}
