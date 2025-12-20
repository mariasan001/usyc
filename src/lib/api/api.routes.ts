export const API = {
  catalogos: {
    carreras: '/api/catalogos/carreras',
    escolaridades: '/api/catalogos/escolaridades',
    estatusRecibo: '/api/catalogos/estatus-recibo',
  },

  alumnos: {
    base: '/api/alumnos',
    pagosResumen: (alumnoId: string) => `/api/alumnos/${encodeURIComponent(alumnoId)}/pagos-resumen`,
  },
} as const;
