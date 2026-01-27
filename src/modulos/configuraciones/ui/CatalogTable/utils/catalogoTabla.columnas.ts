// src/modulos/configuraciones/ui/catalogo-tabla/utils/catalogoTabla.columnas.ts
import type { FilaCatalogo } from '../types/catalogoTabla.types';
import { tieneCampo } from './catalogoTabla.filas';

/**
 * Adivina columnas según el primer item (comportamiento actual).
 * Ordena por especificidad: Conceptos > Carreras > Español > Planteles > TiposPago.
 */
export function adivinarColumnas(item: FilaCatalogo): string[] {
  // ✅ 1) Conceptos
  if (tieneCampo(item, 'conceptoId')) {
    const cols = ['codigo', 'nombre', 'tipoMonto'];
    if (tieneCampo(item, 'activo')) cols.push('activo');
    return cols;
  }

  // ✅ 2) Carreras
  if (tieneCampo(item, 'carreraId')) {
    // Base mínima (nueva estructura)
    const cols: string[] = [
      'carreraId',
      'nombre',
      'escolaridadNombre',
      'duracionAnios',
      'duracionMeses',
    ];

    // ✅ Compatibilidad: si aún vinieran campos legacy, los mostramos
    if (tieneCampo(item, 'montoMensual')) cols.push('montoMensual');
    if (tieneCampo(item, 'montoInscripcion')) cols.push('montoInscripcion');

    // ✅ Nuevo: total proyectado
    if (tieneCampo(item, 'totalProyectado')) cols.push('totalProyectado');

    // ✅ Nuevo: conceptos (array)
    if (tieneCampo(item, 'conceptos')) cols.push('conceptos');

    if (tieneCampo(item, 'activo')) cols.push('activo');
    return cols;
  }

  // ✅ 3) Español (Escolaridades / EstatusRecibo)
  if (tieneCampo(item, 'codigo')) {
    const cols = ['codigo', 'nombre'];
    if (tieneCampo(item, 'activo')) cols.push('activo');
    return cols;
  }

  // ✅ 4) Swagger Planteles
  if (tieneCampo(item, 'address')) {
    const cols = ['code', 'name', 'address'];
    if (tieneCampo(item, 'active')) cols.push('active');
    return cols;
  }

  // ✅ 5) Swagger TiposPago
  if (tieneCampo(item, 'code')) {
    const cols = ['code', 'name'];
    if (tieneCampo(item, 'active')) cols.push('active');
    return cols;
  }

  // Fallback (solo para no romper si llega algo inesperado)
  return Object.keys(item).slice(0, 4);
}
