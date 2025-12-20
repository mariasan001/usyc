// src/lib/api/api.routes.ts
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

    // Tipos de pago
    tiposPago: '/api/catalogos/tipos-pago',
    tipoPagoById: (id: number) => `/api/catalogos/tipos-pago/${id}`,
    tipoPagoActivar: (id: number) => `/api/catalogos/tipos-pago/${id}/activar`,
    tipoPagoDesactivar: (id: number) =>
      `/api/catalogos/tipos-pago/${id}/desactivar`,
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

    // OJO: tu backend AHORITA NO TIENE este GET, por eso te da 404.
    // byId: (id: number) => `/api/recibos/${id}`,

    // QR (image/png)
    qr: (id: number) => `/api/recibos/${id}/qr`,
  },
} as const;
