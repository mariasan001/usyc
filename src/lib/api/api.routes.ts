// src/lib/api/api.routes.ts
export const API = {
  catalogos: {
    // ===== Catálogos base =====
    carreras: '/api/catalogos/carreras',
    escolaridades: '/api/catalogos/escolaridades',
    estatusRecibo: '/api/catalogos/estatus-recibo',

    // ===== Conceptos de pago =====
    conceptosPago: '/api/catalogos/conceptos-pago',
    conceptoPagoById: (conceptoId: number) =>
      `/api/catalogos/conceptos-pago/${conceptoId}`,
    conceptoPagoByCodigo: (codigo: string) =>
      `/api/catalogos/conceptos-pago/por-codigo/${encodeURIComponent(codigo)}`,
    conceptoPagoActivar: (conceptoId: number) =>
      `/api/catalogos/conceptos-pago/${conceptoId}/activar`,
    conceptoPagoDesactivar: (conceptoId: number) =>
      `/api/catalogos/conceptos-pago/${conceptoId}/desactivar`,

    // ===== Tipos de pago =====
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
    // ===== Recibos =====
    base: '/api/recibos',
    create: '/api/recibos', // ✅ POST (registrar pago / emitir recibo)
    byId: (id: number) => `/api/recibos/${id}`, // ✅ GET (detalle recibo)

    // ===== QR =====
    // Swagger: GET /api/recibos/{reciboId}/qr (image/png)
    qr: (id: number) => `/api/recibos/${id}/qr`,
  },
} as const;
