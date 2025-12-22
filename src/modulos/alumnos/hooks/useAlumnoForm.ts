'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  useEscolaridades,
  useCarreras,
  usePlanteles,
} from '@/modulos/configuraciones/hooks';

import { useAlumnoCreate } from './useAlumnoCreate';

import type { Escolaridad } from '@/modulos/configuraciones/types/escolaridades.types';
import type { AlumnoCreate } from '../types/alumno.types';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addMonthsISO(iso: string, months: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const base = new Date(y, (m - 1) + months, d);
  const daysInTargetMonth = new Date(
    base.getFullYear(),
    base.getMonth() + 1,
    0,
  ).getDate();
  const safe = new Date(
    base.getFullYear(),
    base.getMonth(),
    Math.min(d, daysInTargetMonth),
  );
  return `${safe.getFullYear()}-${pad2(safe.getMonth() + 1)}-${pad2(
    safe.getDate(),
  )}`;
}

function normalize(s?: string | null) {
  return (s ?? '').trim().toLowerCase();
}

function carreraEsRequerida(esc?: Escolaridad | null) {
  const nombre = normalize(esc?.nombre);
  const codigo = normalize(esc?.codigo);

  const noAplica =
    nombre.includes('primaria') ||
    nombre.includes('secundaria') ||
    nombre.includes('bach') ||
    codigo === 'pri' ||
    codigo === 'sec' ||
    codigo === 'bac';

  return !noAplica;
}

export function useAlumnoForm() {
  const escolaridadesApi = useEscolaridades({ soloActivos: true });
  const carrerasApi = useCarreras({ soloActivos: true });
  const plantelesApi = usePlanteles({ soloActivos: true });

  const alumnoCreate = useAlumnoCreate();

  // ======================
  // FORM STATE
  // ======================
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [matricula, setMatricula] = useState('');
  const [escolaridadId, setEscolaridadIdState] = useState<number | null>(null);
  const [carreraId, setCarreraId] = useState<string | null>(null);
  const [fechaIngreso, setFechaIngreso] = useState<string>(todayISO());
  const [plantelId, setPlantelId] = useState<number | null>(null);

  // ✅ nuevos (API)
  const [pullPrevReceipts, setPullPrevReceipts] = useState(false);
  const [prevReceiptsNombre, setPrevReceiptsNombre] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [successFlash, setSuccessFlash] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ======================
  // CATALOGS
  // ======================
  const escolaridades = useMemo(
    () => escolaridadesApi.items ?? [],
    [escolaridadesApi.items],
  );

  const planteles = useMemo(
    () => plantelesApi.items ?? [],
    [plantelesApi.items],
  );

  const escolaridadSel = useMemo(() => {
    if (!escolaridadId) return null;
    return (
      escolaridades.find((e) => Number(e.id) === Number(escolaridadId)) ?? null
    );
  }, [escolaridadId, escolaridades]);

  const carreraRequired = useMemo(
    () => carreraEsRequerida(escolaridadSel),
    [escolaridadSel],
  );

  const carrerasFiltradas = useMemo(() => {
    const all = carrerasApi.items ?? [];
    if (!escolaridadId) return [];
    return all.filter((c) => Number(c.escolaridadId) === Number(escolaridadId));
  }, [carrerasApi.items, escolaridadId]);

  const carreraSel = useMemo(() => {
    if (!carreraId) return null;
    return (
      carrerasFiltradas.find((c) => String(c.carreraId) === String(carreraId)) ??
      null
    );
  }, [carreraId, carrerasFiltradas]);

  // ======================
  // COMPUTED
  // ======================
  const precioMensual = useMemo(() => {
    if (!carreraRequired) return 0;
    return Number(carreraSel?.montoMensual ?? 0);
  }, [carreraRequired, carreraSel]);

  const duracionMeses = useMemo(() => {
    if (!carreraRequired) return 0;
    const a = Number(carreraSel?.duracionAnios ?? 0);
    const m = Number(carreraSel?.duracionMeses ?? 0);
    return a * 12 + m;
  }, [carreraRequired, carreraSel]);

  const fechaTermino = useMemo(() => {
    if (!fechaIngreso) return '—';
    if (!carreraRequired || !duracionMeses) return '—';
    return addMonthsISO(fechaIngreso, duracionMeses);
  }, [fechaIngreso, carreraRequired, duracionMeses]);

  const setEscolaridadId = useCallback((id: number | null) => {
    setEscolaridadIdState(id);
    setCarreraId(null);
  }, []);

  // ✅ si apagas migración, limpia el nombre
  const togglePullPrevReceipts = useCallback((v: boolean) => {
    setPullPrevReceipts(v);
    if (!v) setPrevReceiptsNombre('');
  }, []);

  // ======================
  // SUBMIT
  // ======================
  const submit = useCallback(async () => {
    setFormError(null);
    setSuccessFlash(null);

    if (!nombreCompleto.trim()) return setFormError('Falta el nombre.');
    if (!matricula.trim()) return setFormError('Falta la matrícula.');
    if (!escolaridadId) return setFormError('Selecciona una escolaridad.');
    if (!plantelId) return setFormError('Selecciona un plantel.');
    if (!fechaIngreso) return setFormError('Selecciona fecha de ingreso.');
    if (carreraRequired && !carreraId) return setFormError('Selecciona una carrera.');

    // ✅ validación nueva (API)
    if (pullPrevReceipts && prevReceiptsNombre.trim().length < 3) {
      return setFormError('Si migras recibos previos, escribe el nombre (mín. 3 letras).');
    }

    setSubmitting(true);
    try {
      const payload: AlumnoCreate = {
        nombreCompleto: nombreCompleto.trim(),
        matricula: matricula.trim(),
        escolaridadId: Number(escolaridadId),
        plantelId: Number(plantelId),
        fechaIngreso,

        ...(carreraRequired ? { carreraId: String(carreraId) } : {}),

        // ✅ nuevos (solo manda si aplica)
        ...(pullPrevReceipts ? { pullPrevReceipts: true } : { pullPrevReceipts: false }),
        ...(pullPrevReceipts ? { prevReceiptsNombre: prevReceiptsNombre.trim() } : {}),
      };

      const created = await alumnoCreate.create(payload);

      setSuccessFlash(
        created?.alumnoId ? `Alumno creado: ${created.alumnoId}` : 'Alumno creado ✅',
      );

      return created;
    } catch (e: any) {
      setFormError(e?.message ?? 'No se pudo crear el alumno.');
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, [
    nombreCompleto,
    matricula,
    escolaridadId,
    plantelId,
    fechaIngreso,
    carreraRequired,
    carreraId,
    pullPrevReceipts,
    prevReceiptsNombre,
    alumnoCreate,
  ]);

  return {
    // values
    nombreCompleto,
    matricula,
    escolaridadId,
    carreraId,
    plantelId,
    fechaIngreso,

    // ✅ nuevos
    pullPrevReceipts,
    prevReceiptsNombre,

    // setters
    setNombreCompleto,
    setMatricula,
    setEscolaridadId,
    setCarreraId,
    setPlantelId,
    setFechaIngreso,

    // ✅ nuevos
    setPullPrevReceipts: togglePullPrevReceipts,
    setPrevReceiptsNombre,

    // catalogs
    escolaridades,
    carrerasFiltradas,
    planteles,

    // rules / computed
    carreraRequired,
    precioMensual,
    duracionMeses,
    fechaTermino,

    // ui
    formError,
    successFlash,
    submitting,

    // actions
    submit,

    // loading/error
    escolaridadesLoading: escolaridadesApi.isLoading,
    carrerasLoading: carrerasApi.isLoading,
    plantelesLoading: plantelesApi.isLoading,

    escolaridadesError: escolaridadesApi.error,
    carrerasError: carrerasApi.error,
    plantelesError: plantelesApi.error,
  };
}
