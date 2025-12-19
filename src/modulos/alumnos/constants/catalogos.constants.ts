// src/modulos/alumnos/constants/catalogos.constants.ts

import type { Carrera, Escolaridad, ID, Plantel } from '../types/alumnos.tipos';

export const PLANTELES: Plantel[] = [
  { id: 'P1', nombre: 'Plantel 1' },
  { id: 'P2', nombre: 'Plantel 2' },
  { id: 'P3', nombre: 'Plantel 3' },
];

export const ESCOLARIDADES: Escolaridad[] = [
  { id: 'E1', nombre: 'Primaria', nivel: 'PRIMARIA', requiereCarrera: false },
  { id: 'E2', nombre: 'Secundaria', nivel: 'SECUNDARIA', requiereCarrera: false },
  { id: 'E3', nombre: 'Bachillerato', nivel: 'BACHILLERATO', requiereCarrera: false },
  { id: 'E4', nombre: 'Licenciatura', nivel: 'LICENCIATURA', requiereCarrera: true },
  { id: 'E5', nombre: 'Posgrado', nivel: 'POSGRADO', requiereCarrera: true },
];

/**
 * Carreras por escolaridad (mock).
 * Aquí vive “el negocio”: duraciones, precios, etc.
 */
export const CARRERAS: Carrera[] = [
  // Licenciatura
  { id: 'C-LIC-01', nombre: 'Derecho', escolaridadId: 'E4', duracionMeses: 36, precioMensual: 1200 },
  { id: 'C-LIC-02', nombre: 'Administración', escolaridadId: 'E4', duracionMeses: 36, precioMensual: 1150 },
  { id: 'C-LIC-03', nombre: 'Sistemas', escolaridadId: 'E4', duracionMeses: 42, precioMensual: 1350 },

  // Posgrado
  { id: 'C-POS-01', nombre: 'Maestría en Educación', escolaridadId: 'E5', duracionMeses: 18, precioMensual: 2200 },
  { id: 'C-POS-02', nombre: 'Maestría en Derecho', escolaridadId: 'E5', duracionMeses: 18, precioMensual: 2400 },
];

/**
 * Duraciones permitidas por nivel si NO requiere carrera (mock).
 * Puedes ajustar sin tocar UI.
 */
export const DURACIONES_POR_ESCOLARIDAD: Record<ID, number> = {
  E1: 12, // Primaria (ejemplo)
  E2: 18, // Secundaria
  E3: 24, // Bachillerato
  // E4/E5 se definen por carrera
};

/**
 * Precio base mensual si NO requiere carrera.
 */
export const PRECIO_BASE_POR_ESCOLARIDAD: Record<ID, number> = {
  E1: 450,
  E2: 550,
  E3: 650,
};

export function getEscolaridadById(id?: ID | null) {
  return ESCOLARIDADES.find((x) => x.id === id) || null;
}

export function getPlantelById(id?: ID | null) {
  return PLANTELES.find((x) => x.id === id) || null;
}

export function getCarreraById(id?: ID | null) {
  return CARRERAS.find((x) => x.id === id) || null;
}

export function getCarrerasPorEscolaridad(escolaridadId?: ID | null) {
  if (!escolaridadId) return [];
  return CARRERAS.filter((c) => c.escolaridadId === escolaridadId);
}
