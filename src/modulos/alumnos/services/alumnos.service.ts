// src/modulos/alumnos/services/alumnos.service.ts

import type { Alumno, AlumnoCreatePayload, ID } from '../types/alumnos.tipos';
import { normalizarMatricula } from '../utils/alumnos-form.utils';
import {
  calcularDuracionMeses,
  calcularFechaTermino,
  calcularPrecioMensual,
  calcularEstado,
} from '../utils/alumnos-calculos.utils';

const STORAGE_KEY = 'SYC_ALUMNOS_V2';

function nowISO() {
  return new Date().toISOString();
}

function genId(prefix = 'ALU'): ID {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

function readStore(): Alumno[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Alumno[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(list: Alumno[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function seedIfEmpty() {
  const current = readStore();
  if (current.length) return;

  const seed: Alumno[] = [
    {
      id: genId(),
      nombre: 'Ana Torres',
      matricula: 'SYC-0001',
      escolaridadId: 'E4',
      carreraId: 'C-LIC-03',
      plantelId: 'P1',
      fechaIngreso: '2025-01-15',
      duracionMeses: 42,
      precioMensual: 1350,
      fechaTermino: calcularFechaTermino('2025-01-15', 42),
      estado: calcularEstado(calcularFechaTermino('2025-01-15', 42)),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: genId(),
      nombre: 'Luis Méndez',
      matricula: 'SYC-0002',
      escolaridadId: 'E3',
      carreraId: null,
      plantelId: 'P2',
      fechaIngreso: '2024-09-01',
      duracionMeses: 24,
      precioMensual: 650,
      fechaTermino: calcularFechaTermino('2024-09-01', 24),
      estado: calcularEstado(calcularFechaTermino('2024-09-01', 24)),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
  ];

  writeStore(seed);
}

export const AlumnosService = {
  async listar(): Promise<Alumno[]> {
    seedIfEmpty();
    const list = readStore();
    // orden: más nuevo primero
    return list.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  async crear(payload: AlumnoCreatePayload): Promise<Alumno> {
    const list = readStore();

    const matricula = normalizarMatricula(payload.matricula);

    // evitar duplicados (simple)
    const exists = list.some((a) => a.matricula === matricula);
    if (exists) {
      throw new Error('Ya existe un alumno con esa matrícula.');
    }

    const duracionMeses =
      payload.duracionMeses ??
      calcularDuracionMeses({ escolaridadId: payload.escolaridadId, carreraId: payload.carreraId ?? null });

    const precioMensual =
      payload.precioMensual ??
      calcularPrecioMensual({
        escolaridadId: payload.escolaridadId,
        carreraId: payload.carreraId ?? null,
        plantelId: payload.plantelId,
        duracionMeses,
      });

    const fechaTermino = calcularFechaTermino(payload.fechaIngreso, duracionMeses);
    const estado = calcularEstado(fechaTermino);

    const alumno: Alumno = {
      id: genId(),
      nombre: payload.nombre.trim(),
      matricula,
      escolaridadId: payload.escolaridadId,
      carreraId: payload.carreraId ?? null,
      plantelId: payload.plantelId,
      fechaIngreso: payload.fechaIngreso,
      duracionMeses,
      precioMensual,
      fechaTermino,
      estado,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    const next = [alumno, ...list];
    writeStore(next);
    return alumno;
  },
};
