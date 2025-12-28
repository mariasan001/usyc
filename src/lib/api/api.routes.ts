// src/lib/api/api.routes.ts
// ✅ Centraliza las rutas de backend para evitar strings dispersos por el proyecto.
// ✅ Agregamos auth.* porque ahora conectamos login/me/logout reales.

export const API = {
  catalogos: {
    carreras: '/api/catalogos/carreras',
    escolaridades: '/api/catalogos/escolaridades',
    estatusRecibo: '/api/catalogos/estatus-recibo',

    conceptosPago: '/api/catalogos/conceptos-pago',
    conceptoPagoById: (conceptoId: number) =>
      `/api/catalogos/conceptos-pago/${conceptoId}`,
    conceptoPagoByCodigo: (codigo: string) =>
      `/api/catalogos/conceptos-pago/por-codigo/${encodeURIComponent(codigo)}`,
    conceptoPagoActivar: (conceptoId: number) =>
      `/api/catalogos/conceptos-pago/${conceptoId}/activar`,
    conceptoPagoDesactivar: (conceptoId: number) =>
      `/api/catalogos/conceptos-pago/${conceptoId}/desactivar`,

    tiposPago: '/api/catalogos/tipos-pago',
    tipoPagoById: (id: number) => `/api/catalogos/tipos-pago/${id}`,
    tipoPagoActivar: (id: number) => `/api/catalogos/tipos-pago/${id}/activar`,
    tipoPagoDesactivar: (id: number) =>
      `/api/catalogos/tipos-pago/${id}/desactivar`,

    planteles: '/api/catalogos/planteles',
    plantelById: (id: number) => `/api/catalogos/planteles/${id}`,
  },

  // ✅ Auth (cookie-based)
  auth: {
    login: '/api/auth/login',
    me: '/api/auth/me',
    logout: '/api/auth/logout',
  },

  alumnos: {
    base: '/api/alumnos',
    byId: (alumnoId: string) => `/api/alumnos/${encodeURIComponent(alumnoId)}`,
    pagosResumen: (alumnoId: string) =>
      `/api/alumnos/${encodeURIComponent(alumnoId)}/pagos-resumen`,
  },

  recibos: {
    base: '/api/recibos',
    create: '/api/recibos', // POST
    qr: (id: number) => `/api/recibos/${id}/qr`,
    validarQr: (qrPayload: string) =>
      `/api/recibos/validar-qr?qrPayload=${encodeURIComponent(qrPayload)}`,
  },

  aux: {
    recibosPreviosCount: '/api/aux/recibos-previos/count',
  },
} as const;
