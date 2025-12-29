import type { Escolaridad } from '@/modulos/configuraciones/types/escolaridades.types';
import { normalizarTexto } from './nombre';
import { leerStringOpcional } from './extraerCampo';

/**
 * Reglas de UI/negocio para el selector que depende de escolaridad.
 *
 * Contexto:
 * - Aunque “Primaria/Secundaria/Bachillerato” no sean “carreras” como tal,
 *   en tu sistema SIEMPRE necesitas seleccionar un “programa/nivel” para:
 *   - obtener mensualidad/inscripción
 *   - calcular duración
 *
 * Por eso:
 * - Ya NO usamos la idea de “no aplica” para deshabilitar el selector.
 * - Lo que cambia es el NOMBRE del campo mostrado al usuario.
 *
 * Resultado:
 * - Para primaria/secundaria/bach: etiqueta “Nivel académico”
 * - Para el resto: etiqueta “Carrera”
 */

/** Tipos de etiqueta posibles para el selector dependiente de escolaridad */
export type EtiquetaSelectorPrograma = 'Carrera' | 'Nivel académico';

/**
 * Determina si la escolaridad debe mostrarse como “nivel” en UI,
 * en lugar de “carrera”, para evitar confusión.
 *
 * Criterios:
 * - Se apoya en nombre y (si existe) código.
 * - Mantiene compatibilidad si el type Escolaridad no trae `codigo`.
 */
export function escolaridadUsaNivelAcademico(esc?: Escolaridad | null): boolean {
  const nombre = normalizarTexto(esc?.nombre);
  const codigo = normalizarTexto(leerStringOpcional(esc, 'codigo'));

  const esBasica =
    nombre.includes('primaria') ||
    nombre.includes('secundaria') ||
    nombre.includes('bach') ||
    codigo === 'pri' ||
    codigo === 'sec' ||
    codigo === 'bac';

  return esBasica;
}

/**
 * Devuelve la etiqueta correcta para el selector:
 * - “Nivel académico” para escolaridades básicas
 * - “Carrera” para el resto
 */
export function etiquetaProgramaPorEscolaridad(esc?: Escolaridad | null): EtiquetaSelectorPrograma {
  return escolaridadUsaNivelAcademico(esc) ? 'Nivel académico' : 'Carrera';
}
