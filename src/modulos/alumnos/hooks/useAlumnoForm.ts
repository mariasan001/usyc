// src/modulos/alumnos/hooks/useAlumnoForm.ts
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useEscolaridades, useCarreras, usePlanteles } from '@/modulos/configuraciones/hooks';
import { useAlumnoCreate } from './useAlumnoCreate';
import { AlumnosService } from '../services/alumnos.service';

import type { Escolaridad } from '@/modulos/configuraciones/types/escolaridades.types';
import type { Carrera } from '@/modulos/configuraciones/types/carreras.types';
import type { Plantel } from '@/modulos/configuraciones/types/planteles.types';
import type { AlumnoCreate } from '../types/alumno.types';

import { hoyISO, sumarMesesISO } from './utils/fechasISO';
import { nombreMinimoParaBuscar } from './utils/nombre';
import { etiquetaProgramaPorEscolaridad } from './utils/escolaridadReglas';
import { leerNumeroOpcional } from './utils/extraerCampo';
import { normalizarNombreMayusculas } from './utils/nombreAlumno';

type ConteoRecibosPrevios = {
  totalRecibosPrevios?: number;
};

/**
 * Payload extendido SOLO para este flujo (sin romper tu AlumnoCreate base).
 * - Backend sigue recibiendo `carreraId` como hoy.
 * - Migración: se manda `prevReceiptsNombre` cuando aplica.
 */
type AlumnoCreateConMigracion = AlumnoCreate & {
  pullPrevReceipts: boolean;
  prevReceiptsNombre?: string;
};

/**
 * Hook del formulario de registro de alumno.
 *
 * Objetivos:
 * - Mantener comportamiento actual (mismos endpoints, mismo payload).
 * - Sin `any`, sin eslint-disable, sin hacks.
 * - Regla nueva: SIEMPRE se selecciona un “programa” que vive en `carreraId`.
 *   - Para primaria/secundaria/bach => UI lo llama “Nivel académico”
 *   - Para el resto => UI lo llama “Carrera”
 *
 * Nombre:
 * - Siempre se captura y se muestra en MAYÚSCULAS.
 * - Validación: formato APELLIDOS NOMBRES (homologación).
 *
 * Migración:
 * - El usuario NO escribe el nombre para recibos previos.
 * - Se usa exactamente `nombreCompleto` (ya normalizado).
 */
export function useAlumnoForm() {
  // Catálogos (solo activos)
  const escolaridadesApi = useEscolaridades({ soloActivos: true });
  const carrerasApi = useCarreras({ soloActivos: true });
  const plantelesApi = usePlanteles({ soloActivos: true });

  // Acción de creación (hook existente)
  const alumnoCreate = useAlumnoCreate();

  // Campos del formulario
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [matricula, setMatricula] = useState('');
  const [escolaridadId, setEscolaridadIdState] = useState<number | null>(null);

  /**
   * NOTA:
   * - Se mantiene `carreraId` como nombre por compatibilidad (backend/DTO).
   * - En UI este campo se mostrará como “Carrera” o “Nivel académico”.
   */
  const [carreraId, setCarreraId] = useState<string | null>(null);

  const [fechaIngreso, setFechaIngreso] = useState<string>(hoyISO());
  const [plantelId, setPlantelId] = useState<number | null>(null);

  // Migración recibos previos
  const [pullPrevReceipts, setPullPrevReceipts] = useState(false);

  // Conteo recibos previos por nombre
  const [prevCount, setPrevCount] = useState<number | null>(null);
  const [prevCountLoading, setPrevCountLoading] = useState(false);
  const [prevCountError, setPrevCountError] = useState<string | null>(null);

  // UI
  const [formError, setFormError] = useState<string | null>(null);
  const [successFlash, setSuccessFlash] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Debounce + control de obsolescencia de requests
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const ultimoNombreConsultadoRef = useRef<string>('');

  /**
   * Setter oficial de nombre:
   * - Siempre en MAYÚSCULAS
   * - Normalizado (trim / espacios)
   */
  const setNombreCompletoUpper = useCallback((v: string) => {
    setNombreCompleto(normalizarNombreMayusculas(v));
  }, []);

  // Colecciones tipadas (evita null/undefined)
  const escolaridades = useMemo<Escolaridad[]>(
    () => (escolaridadesApi.items ?? []) as Escolaridad[],
    [escolaridadesApi.items],
  );

  const planteles = useMemo<Plantel[]>(
    () => (plantelesApi.items ?? []) as Plantel[],
    [plantelesApi.items],
  );

  const carreras = useMemo<Carrera[]>(
    () => (carrerasApi.items ?? []) as Carrera[],
    [carrerasApi.items],
  );

  // Selecciones actuales
  const escolaridadSel = useMemo<Escolaridad | null>(() => {
    if (!escolaridadId) return null;
    return escolaridades.find((e) => Number(e.id) === Number(escolaridadId)) ?? null;
  }, [escolaridadId, escolaridades]);

  /**
   * Etiqueta dinámica para el selector de “programa”:
   * - Primaria/Secundaria/Bach => “Nivel académico”
   * - Resto => “Carrera”
   */
  const etiquetaPrograma = useMemo(() => etiquetaProgramaPorEscolaridad(escolaridadSel), [escolaridadSel]);

  /**
   * Regla: una vez seleccionada la escolaridad, el programa debe seleccionarse.
   */
  const programaObligatorio = useMemo<boolean>(() => Boolean(escolaridadId), [escolaridadId]);

  /**
   * Lista de programas disponibles para la escolaridad seleccionada.
   * (Sigue siendo el mismo filtro por escolaridadId).
   */
  const carrerasFiltradas = useMemo<Carrera[]>(() => {
    if (!escolaridadId) return [];
    return carreras.filter((c) => Number(c.escolaridadId) === Number(escolaridadId));
  }, [carreras, escolaridadId]);

  /**
   * Programa seleccionado (por `carreraId`).
   */
  const carreraSel = useMemo<Carrera | null>(() => {
    if (!carreraId) return null;
    return carrerasFiltradas.find((c) => String(c.carreraId) === String(carreraId)) ?? null;
  }, [carreraId, carrerasFiltradas]);

  // Derivados (siempre desde el programa seleccionado)
  const precioMensual = useMemo<number>(() => {
    const directo = typeof carreraSel?.montoMensual === 'number' ? carreraSel.montoMensual : 0;
    return directo || leerNumeroOpcional(carreraSel, 'montoMensual');
  }, [carreraSel]);

  const duracionMeses = useMemo<number>(() => {
    const anios = typeof carreraSel?.duracionAnios === 'number' ? carreraSel.duracionAnios : 0;
    const meses = typeof carreraSel?.duracionMeses === 'number' ? carreraSel.duracionMeses : 0;

    const aniosSafe = anios || leerNumeroOpcional(carreraSel, 'duracionAnios');
    const mesesSafe = meses || leerNumeroOpcional(carreraSel, 'duracionMeses');

    return aniosSafe * 12 + mesesSafe;
  }, [carreraSel]);

  const fechaTermino = useMemo<string>(() => {
    if (!fechaIngreso) return '—';
    if (!duracionMeses) return '—';
    return sumarMesesISO(fechaIngreso, duracionMeses);
  }, [fechaIngreso, duracionMeses]);

  /**
   * Setter “inteligente”:
   * - Al cambiar escolaridad, reinicia el programa seleccionado.
   */
  const setEscolaridadId = useCallback((id: number | null) => {
    setEscolaridadIdState(id);
    setCarreraId(null);
  }, []);

  /**
   * Efecto: consulta (debounce) de recibos previos por nombre.
   * - Usa el nombre YA NORMALIZADO.
   * - Ignora respuestas viejas (requestId).
   * - Evita repetir consulta si el nombre no cambió.
   */
  useEffect(() => {
    const nombre = normalizarNombreMayusculas(nombreCompleto);

    setPrevCountError(null);

    if (!nombreMinimoParaBuscar(nombre)) {
      setPrevCount(null);
      ultimoNombreConsultadoRef.current = '';
      return;
    }

    if (ultimoNombreConsultadoRef.current === nombre) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      ultimoNombreConsultadoRef.current = nombre;

      const requestId = ++requestIdRef.current;
      setPrevCountLoading(true);

      try {
        const r = (await AlumnosService.countRecibosPreviosByNombre(nombre)) as ConteoRecibosPrevios;
        const total = Number(r?.totalRecibosPrevios ?? 0);
        const safeTotal = Number.isFinite(total) ? total : 0;

        if (requestIdRef.current !== requestId) return;
        setPrevCount(safeTotal);
      } catch (e: unknown) {
        if (requestIdRef.current !== requestId) return;

        setPrevCount(null);
        setPrevCountError(e instanceof Error ? e.message : 'No se pudo consultar recibos previos.');
      } finally {
        if (requestIdRef.current === requestId) setPrevCountLoading(false);
      }
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nombreCompleto]);

  /**
   * Submit:
   * - Valida formato APELLIDOS NOMBRES.
   * - Programa obligatorio si ya hay escolaridad.
   * - Migración: prevReceiptsNombre = nombreCompleto (ya normalizado).
   */
  const submit = useCallback(async () => {
    setFormError(null);
    setSuccessFlash(null);

    const nombreMayus = normalizarNombreMayusculas(nombreCompleto);
    const matriculaTrim = matricula.trim();

    if (!nombreMayus) return setFormError('Falta el nombre.');

  
    if (!matriculaTrim) return setFormError('Falta la matrícula.');
    if (!escolaridadId) return setFormError('Selecciona una escolaridad.');
    if (!plantelId) return setFormError('Selecciona un plantel.');
    if (!fechaIngreso) return setFormError('Selecciona fecha de ingreso.');

    if (programaObligatorio && !carreraId) {
      return setFormError(
        `Selecciona un${etiquetaPrograma === 'Carrera' ? 'a' : ''} ${etiquetaPrograma.toLowerCase()}.`,
      );
    }

    const prevReceiptsNombre = nombreMayus;

    setSubmitting(true);
    try {
      const payload: AlumnoCreateConMigracion = {
        nombreCompleto: nombreMayus,
        matricula: matriculaTrim,
        escolaridadId: Number(escolaridadId),
        plantelId: Number(plantelId),
        fechaIngreso,
        ...(programaObligatorio ? { carreraId: String(carreraId) } : {}),

        pullPrevReceipts: Boolean(pullPrevReceipts),
        ...(pullPrevReceipts ? { prevReceiptsNombre } : {}),
      };

      const created = await alumnoCreate.create(payload);

   setSuccessFlash(
  created && typeof created === 'object' && 'alumnoId' in created && created.alumnoId
    ? `Alumno creado: ${String(created.alumnoId)}`
    : 'Alumno creado ✅',
);

// auto-hide
setTimeout(() => setSuccessFlash(null), 2500);

      return created;
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'No se pudo crear el alumno.');
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
    programaObligatorio,
    carreraId,
    etiquetaPrograma,
    pullPrevReceipts,
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

    // UI del selector programa
    etiquetaPrograma,
    programaObligatorio,

    // migración (acuerdo)
    pullPrevReceipts,

    // contador recibos previos
    prevCount,
    prevCountLoading,
    prevCountError,

    // setters
    setNombreCompleto: setNombreCompletoUpper,
    setMatricula,
    setEscolaridadId,
    setCarreraId,
    setPlantelId,
    setFechaIngreso,
    setPullPrevReceipts,

    // catálogos
    escolaridades,
    carrerasFiltradas,
    planteles,

    // computados
    precioMensual,
    duracionMeses,
    fechaTermino,

    // ui
    formError,
    successFlash,
    submitting,

    // actions
    submit,

    // loading/error de catálogos (respeta el shape real de tus hooks)
    escolaridadesLoading: escolaridadesApi.isLoading,
    carrerasLoading: carrerasApi.isLoading,
    plantelesLoading: plantelesApi.loading,

    escolaridadesError: escolaridadesApi.error,
    carrerasError: carrerasApi.error,
    plantelesError: plantelesApi.error,
  };
}
