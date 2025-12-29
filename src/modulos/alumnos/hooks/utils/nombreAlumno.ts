// src/modulos/alumnos/hooks/utils/nombreAlumno.ts

/**
 * Normaliza el nombre mientras el usuario escribe:
 * - MAYÚSCULAS siempre
 * - Permite espacios (incluyendo el espacio final mientras vas escribiendo)
 * - Quita caracteres raros (deja letras, acentos y espacios)
 * - Evita dobles espacios dentro (pero NO elimina el espacio final si el usuario lo acaba de teclear)
 */
export function normalizarNombreMayusculas(input: string): string {
  const raw = String(input ?? '');

  // ¿El usuario acaba de teclear un espacio al final?
  const terminaEnEspacio = /\s$/.test(raw);

  // MAYÚSCULAS + limpieza de caracteres (letras, acentos, ñ, ü y espacios)
  let v = raw
    .toUpperCase()
    .replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, '');

  // Quita espacios al inicio (para que no empiece con espacios)
  v = v.replace(/^\s+/, '');

  // Colapsa múltiples espacios INTERNOS a 1 (pero ojo con el final)
  v = v.replace(/\s+/g, ' ');

  // Si el usuario acaba de teclear espacio, lo respetamos (sin volverlo doble)
  if (terminaEnEspacio && !v.endsWith(' ')) v += ' ';

  return v;
}
