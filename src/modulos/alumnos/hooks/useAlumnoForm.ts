// src/modulos/alumnos/hooks/useAlumnoForm.ts
'use client';

import { useCallback, useMemo, useState } from 'react';
import type { AlumnoCreatePayload, ID } from '../types/alumnos.tipos';

import { ESCOLARIDADES, PLANTELES, getCarrerasPorEscolaridad } from '../constants/catalogos.constants';
import { calcularDuracionMeses, calcularFechaTermino, calcularPrecioMensual } from '../utils/alumnos-calculos.utils';
import { normalizarMatricula, requiereCarrera, validarPayload } from '../utils/alumnos-form.utils';

type SubmitFn = (payload: AlumnoCreatePayload) => Promise<any>;

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useAlumnoForm(onSubmit: SubmitFn) {
  const [nombre, setNombre] = useState('');
  const [matricula, setMatricula] = useState('');
  const [escolaridadId, setEscolaridadId] = useState<ID>(ESCOLARIDADES[0]?.id ?? 'E1');
  const [carreraId, setCarreraId] = useState<ID | null>(null);
  const [plantelId, setPlantelId] = useState<ID>(PLANTELES[0]?.id ?? 'P1');
  const [fechaIngreso, setFechaIngreso] = useState<string>(todayISO());

  // futuro
  const [pagoInicialAplica, setPagoInicialAplica] = useState(false);
  const [pagoInicialMonto, setPagoInicialMonto] = useState<number>(0);

  const carreras = useMemo(() => getCarrerasPorEscolaridad(escolaridadId), [escolaridadId]);

  const carreraRequired = useMemo(() => requiereCarrera(escolaridadId), [escolaridadId]);

  // asegurar consistencia: si cambia escolaridad y ya no aplica carrera, limpiamos
  const safeCarreraId = useMemo(() => {
    if (!carreraRequired) return null;
    return carreraId;
  }, [carreraRequired, carreraId]);

  const duracionMeses = useMemo(() => {
    return calcularDuracionMeses({ escolaridadId, carreraId: safeCarreraId });
  }, [escolaridadId, safeCarreraId]);

  const precioMensual = useMemo(() => {
    return calcularPrecioMensual({
      escolaridadId,
      carreraId: safeCarreraId,
      plantelId,
      duracionMeses,
    });
  }, [escolaridadId, safeCarreraId, plantelId, duracionMeses]);

  const fechaTermino = useMemo(() => {
    return calcularFechaTermino(fechaIngreso, duracionMeses);
  }, [fechaIngreso, duracionMeses]);

  const payload: AlumnoCreatePayload = useMemo(
    () => ({
      nombre,
      matricula: normalizarMatricula(matricula),
      escolaridadId,
      carreraId: safeCarreraId,
      plantelId,
      fechaIngreso,
      pagoInicialAplica,
      pagoInicialMonto,
    }),
    [nombre, matricula, escolaridadId, safeCarreraId, plantelId, fechaIngreso, pagoInicialAplica, pagoInicialMonto]
  );

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successFlash, setSuccessFlash] = useState<string | null>(null);

  const setEscolaridadSafe = useCallback((id: ID) => {
    setEscolaridadId(id);
    // reset carrera cuando cambias escolaridad
    setCarreraId(null);
  }, []);

  const submit = useCallback(async () => {
    setFormError(null);
    setSuccessFlash(null);

    const val = validarPayload(payload);
    if (!val.ok) {
      setFormError(val.message);
      return null;
    }

    try {
      setSubmitting(true);
      const created = await onSubmit(payload);

      setSuccessFlash('Alumno generado ✅');
      // reset leve (mantén plantel y escolaridad para captura rápida)
      setNombre('');
      setMatricula('');
      setCarreraId(null);
      setPagoInicialAplica(false);
      setPagoInicialMonto(0);

      return created;
    } catch (e: any) {
      setFormError(e?.message ?? 'No se pudo crear el alumno.');
      return null;
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessFlash(null), 1800);
    }
  }, [onSubmit, payload]);

  return {
    // options
    escolaridades: ESCOLARIDADES,
    planteles: PLANTELES,
    carreras,

    // values + setters
    nombre,
    setNombre,
    matricula,
    setMatricula,

    escolaridadId,
    setEscolaridadId: setEscolaridadSafe,

    carreraId: safeCarreraId,
    setCarreraId,

    plantelId,
    setPlantelId,

    fechaIngreso,
    setFechaIngreso,

    pagoInicialAplica,
    setPagoInicialAplica,
    pagoInicialMonto,
    setPagoInicialMonto,

    // computed
    carreraRequired,
    duracionMeses,
    precioMensual,
    fechaTermino,

    // submit state
    submitting,
    formError,
    successFlash,
    submit,
  };
}
