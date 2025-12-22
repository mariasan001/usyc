'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useEscolaridades, useCarreras, usePlanteles } from '@/modulos/configuraciones/hooks';

import { useAlumnoCreate } from './useAlumnoCreate';
import { AlumnosService } from '../services/alumnos.service';

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
  const daysInTargetMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const safe = new Date(base.getFullYear(), base.getMonth(), Math.min(d, daysInTargetMonth));
  return `${safe.getFullYear()}-${pad2(safe.getMonth() + 1)}-${pad2(safe.getDate())}`;
}

function normalize(s?: string | null) {
  return (s ?? '').trim().toLowerCase();
}

function carreraEsRequerida(esc?: Escolaridad | null) {
  const nombre = normalize(esc?.nombre);
  const codigo = normalize((esc as any)?.codigo); // por si tu type no trae codigo

  const noAplica =
    nombre.includes('primaria') ||
    nombre.includes('secundaria') ||
    nombre.includes('bach') ||
    codigo === 'pri' ||
    codigo === 'sec' ||
    codigo === 'bac';

  return !noAplica;
}

function nombreMinOk(nombre: string) {
  // evita spamear API con "lu" o espacios
  const t = (nombre ?? '').trim();
  return t.length >= 6; // ajustable (6-8 suele ir bien)
}

export function useAlumnoForm() {
  const escolaridadesApi = useEscolaridades({ soloActivos: true });
  const carrerasApi = useCarreras({ soloActivos: true });
  const plantelesApi = usePlanteles({ soloActivos: true });

  const alumnoCreate = useAlumnoCreate();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [matricula, setMatricula] = useState('');
  const [escolaridadId, setEscolaridadIdState] = useState<number | null>(null);
  const [carreraId, setCarreraId] = useState<string | null>(null);
  const [fechaIngreso, setFechaIngreso] = useState<string>(todayISO());
  const [plantelId, setPlantelId] = useState<number | null>(null);

  // ✅ NUEVO: migración recibos previos
  const [pullPrevReceipts, setPullPrevReceipts] = useState(false);
  const [prevReceiptsNombre, setPrevReceiptsNombre] = useState('');

  // ✅ NUEVO: count recibos previos por nombre
  const [prevCount, setPrevCount] = useState<number | null>(null);
  const [prevCountLoading, setPrevCountLoading] = useState(false);
  const [prevCountError, setPrevCountError] = useState<string | null>(null);

  const lastQueryRef = useRef<string>('');
  const debounceRef = useRef<number | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [successFlash, setSuccessFlash] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const escolaridades = useMemo(() => escolaridadesApi.items ?? [], [escolaridadesApi.items]);
  const planteles = useMemo(() => plantelesApi.items ?? [], [plantelesApi.items]);

  const escolaridadSel = useMemo(() => {
    if (!escolaridadId) return null;
    return escolaridades.find((e) => Number(e.id) === Number(escolaridadId)) ?? null;
  }, [escolaridadId, escolaridades]);

  const carreraRequired = useMemo(() => carreraEsRequerida(escolaridadSel), [escolaridadSel]);

  const carrerasFiltradas = useMemo(() => {
    const all = carrerasApi.items ?? [];
    if (!escolaridadId) return [];
    return all.filter((c) => Number(c.escolaridadId) === Number(escolaridadId));
  }, [carrerasApi.items, escolaridadId]);

  const carreraSel = useMemo(() => {
    if (!carreraId) return null;
    return carrerasFiltradas.find((c) => String(c.carreraId) === String(carreraId)) ?? null;
  }, [carreraId, carrerasFiltradas]);

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
    if (!carreraRequired || !duracionMeses) return '—';
    return addMonthsISO(fechaIngreso, duracionMeses);
  }, [fechaIngreso, carreraRequired, duracionMeses]);

  const setEscolaridadId = useCallback((id: number | null) => {
    setEscolaridadIdState(id);
    setCarreraId(null);
  }, []);

  // ✅ Efecto: consultar recibos previos por nombre (debounce)
  useEffect(() => {
    const nombre = (nombreCompleto ?? '').trim();

    setPrevCountError(null);

    if (!nombreMinOk(nombre)) {
      setPrevCount(null);
      // si el nombre aún no es “usable”, no mostramos nada
      return;
    }

    if (lastQueryRef.current === nombre) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      lastQueryRef.current = nombre;
      setPrevCountLoading(true);

      try {
        const r = await AlumnosService.countRecibosPreviosByNombre(nombre);
        const total = Number(r?.totalRecibosPrevios ?? 0);
        setPrevCount(Number.isFinite(total) ? total : 0);

        // 🎯 UX: si hay recibos previos, sugerimos activar migración
        // (no lo forzamos, solo ayudamos)
        if ((Number.isFinite(total) ? total : 0) > 0) {
          // si aún no escribió un nombre de migración, proponemos uno
          if (!prevReceiptsNombre.trim()) {
            setPrevReceiptsNombre(`${nombre}`);
          }
        }
      } catch (e: any) {
        setPrevCount(null);
        setPrevCountError(e?.message ?? 'No se pudo consultar recibos previos.');
      } finally {
        setPrevCountLoading(false);
      }
    }, 450);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombreCompleto]);

  const submit = useCallback(async () => {
    setFormError(null);
    setSuccessFlash(null);

    if (!nombreCompleto.trim()) return setFormError('Falta el nombre.');
    if (!matricula.trim()) return setFormError('Falta la matrícula.');
    if (!escolaridadId) return setFormError('Selecciona una escolaridad.');
    if (!plantelId) return setFormError('Selecciona un plantel.');
    if (!fechaIngreso) return setFormError('Selecciona fecha de ingreso.');
    if (carreraRequired && !carreraId) return setFormError('Selecciona una carrera.');

    // ✅ validación migración
    if (pullPrevReceipts) {
      if (prevReceiptsNombre.trim().length < 3) {
        return setFormError('Escribe el nombre para recibos previos (mín. 3 letras).');
      }
    }

    setSubmitting(true);
    try {
      const payload: any = {
        nombreCompleto: nombreCompleto.trim(),
        matricula: matricula.trim(),
        escolaridadId: Number(escolaridadId),
        plantelId: Number(plantelId),
        fechaIngreso,
        ...(carreraRequired ? { carreraId: String(carreraId) } : {}),

        // ✅ mandar solo lo necesario
        pullPrevReceipts: !!pullPrevReceipts,
        ...(pullPrevReceipts ? { prevReceiptsNombre: prevReceiptsNombre.trim() } : {}),
      } satisfies AlumnoCreate & {
        pullPrevReceipts: boolean;
        prevReceiptsNombre?: string;
      };

      const created = await alumnoCreate.create(payload);

      setSuccessFlash(created?.alumnoId ? `Alumno creado: ${created.alumnoId}` : 'Alumno creado ✅');
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

    // ✅ migración
    pullPrevReceipts,
    prevReceiptsNombre,

    // ✅ contador
    prevCount,
    prevCountLoading,
    prevCountError,

    // setters
    setNombreCompleto,
    setMatricula,
    setEscolaridadId,
    setCarreraId,
    setPlantelId,
    setFechaIngreso,

    setPullPrevReceipts,
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
