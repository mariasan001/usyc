// src/modulos/alumnos/utils/alumnos-form.utils.ts

import type { AlumnoCreatePayload, ID } from '../types/alumnos.tipos';
import { getEscolaridadById } from '../constants/catalogos.constants';
import { calcularDuracionMeses } from './alumnos-calculos.utils';

export function requiereCarrera(escolaridadId?: ID | null): boolean {
  const esc = getEscolaridadById(escolaridadId ?? null);
  return Boolean(esc?.requiereCarrera);
}

export function duracionPorDefecto(escolaridadId: ID, carreraId?: ID | null): number {
  return calcularDuracionMeses({ escolaridadId, carreraId });
}

export function normalizarMatricula(input: string): string {
  return (input ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9-]/g, '');
}

export function validarPayload(payload: AlumnoCreatePayload): { ok: true } | { ok: false; message: string } {
  if (!payload.nombre?.trim()) return { ok: false, message: 'El nombre es obligatorio.' };
  if (!payload.matricula?.trim()) return { ok: false, message: 'La matrícula es obligatoria.' };
  if (!payload.escolaridadId) return { ok: false, message: 'Selecciona escolaridad.' };
  if (!payload.plantelId) return { ok: false, message: 'Selecciona plantel.' };
  if (!payload.fechaIngreso) return { ok: false, message: 'Selecciona fecha de ingreso.' };

  const esc = getEscolaridadById(payload.escolaridadId);
  if (!esc) return { ok: false, message: 'Escolaridad inválida.' };

  if (esc.requiereCarrera && !payload.carreraId) {
    return { ok: false, message: 'Selecciona carrera.' };
  }

  // Pago inicial (futuro): validación suave
  if (payload.pagoInicialAplica && (payload.pagoInicialMonto ?? 0) <= 0) {
    return { ok: false, message: 'Si aplica pago inicial, el monto debe ser mayor a 0.' };
  }

  return { ok: true };
}
