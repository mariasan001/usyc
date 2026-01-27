// src/modulos/configuraciones/ui/catalogo-tabla/utils/catalogoTabla.texto.ts

/**
 * Convierte errores variados a un mensaje legible.
 * Soporta:
 * - Error
 * - { message: '...' }
 * - string
 */
export function getMensajeError(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }

  if (typeof error === 'string' && error.trim()) return error;

  return 'Error desconocido';
}

/**
 * Convierte claves (keys) en encabezados amigables.
 * Mantiene mapa explícito para consistencia visual.
 */
export function tituloColumna(key: string): string {
  const map: Record<string, string> = {
    codigo: 'Código',
    nombre: 'Nombre',
    activo: 'Activo',

    code: 'Código',
    name: 'Nombre',
    address: 'Dirección',
    active: 'Activo',

    carreraId: 'ID',
    escolaridadNombre: 'Escolaridad',
    montoMensual: 'Mensualidad',
    montoInscripcion: 'Inscripción',
    duracionAnios: 'Años',
    duracionMeses: 'Meses',

    // ✅ nuevo (carreras)
    totalProyectado: 'Total proyectado',
    conceptos: 'Conceptos',

    tipoMonto: 'Tipo de monto',
  };

  return (
    map[key] ??
    key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (m) => m.toUpperCase())
  );
}
