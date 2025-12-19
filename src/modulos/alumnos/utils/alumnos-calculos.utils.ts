// src/modulos/alumnos/utils/alumnos-calculos.utils.ts

import type { AlumnoEstado, ID } from '../types/alumnos.tipos';
import {
  DURACIONES_POR_ESCOLARIDAD,
  PRECIO_BASE_POR_ESCOLARIDAD,
  getCarreraById,
  getEscolaridadById,
} from '../constants/catalogos.constants';

function toDateOnlyISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODateOnly(value: string): Date | null {
  // Acepta "YYYY-MM-DD"
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function calcularFechaTermino(fechaIngresoISO: string, duracionMeses: number): string {
  const d = parseISODateOnly(fechaIngresoISO);
  if (!d || !Number.isFinite(duracionMeses) || duracionMeses <= 0) return fechaIngresoISO;

  const dt = new Date(d);
  dt.setMonth(dt.getMonth() + duracionMeses);

  // Mantener date-only
  return toDateOnlyISO(dt);
}

export function calcularEstado(fechaTerminoISO: string, hoy = new Date()): AlumnoEstado {
  const ft = parseISODateOnly(fechaTerminoISO);
  if (!ft) return 'ACTIVO';

  const today = new Date(toDateOnlyISO(hoy) + 'T00:00:00');
  const diffMs = ft.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'EGRESADO';
  if (diffDays <= 30) return 'POR_VENCER';
  return 'ACTIVO';
}

export function calcularDuracionMeses(args: { escolaridadId: ID; carreraId?: ID | null }): number {
  const esc = getEscolaridadById(args.escolaridadId);
  if (!esc) return 0;

  if (esc.requiereCarrera) {
    const car = getCarreraById(args.carreraId ?? null);
    return car?.duracionMeses ?? 0;
  }

  return DURACIONES_POR_ESCOLARIDAD[esc.id] ?? 0;
}

export function calcularPrecioMensual(args: {
  escolaridadId: ID;
  carreraId?: ID | null;
  plantelId: ID;
  duracionMeses: number;
}): number {
  const esc = getEscolaridadById(args.escolaridadId);
  if (!esc) return 0;

  // Nota: plantelId reservado para reglas futuras (promos/recargos/planes).
  if (esc.requiereCarrera) {
    const car = getCarreraById(args.carreraId ?? null);
    return car?.precioMensual ?? 0;
  }

  return PRECIO_BASE_POR_ESCOLARIDAD[esc.id] ?? 0;
}
