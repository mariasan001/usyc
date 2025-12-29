// src/modulos/configuraciones/ui/catalogo-tabla/utils/catalogoTabla.filas.ts
import type { FilaCatalogo } from '../types/catalogoTabla.types';

/**
 * Regresa true si la llave existe en el objeto y su valor no es undefined.
 * Útil para diferenciar "no viene en el API" vs "viene vacío".
 */
export function tieneCampo(it: FilaCatalogo, key: keyof FilaCatalogo): boolean {
  return Object.prototype.hasOwnProperty.call(it, key) && it[key] !== undefined;
}

/**
 * Genera key estable para React.
 * Prioridad: id > conceptoId > code/codigo > carreraId
 */
export function keyFila(it: FilaCatalogo): string {
  const k = it.id ?? it.conceptoId ?? it.code ?? it.codigo ?? it.carreraId;
  return String(k ?? Math.random());
}

/**
 * Determina si la fila está activa considerando ambas variantes:
 * - swagger: active
 * - español: activo
 */
export function filaActiva(it: FilaCatalogo): boolean {
  return Boolean((it.active ?? it.activo) === true);
}

/**
 * Indica si la fila soporta togglear "activo".
 * Solo si el API trae active/activo.
 */
export function soportaToggleActivo(it: FilaCatalogo): boolean {
  return tieneCampo(it, 'active') || tieneCampo(it, 'activo');
}
