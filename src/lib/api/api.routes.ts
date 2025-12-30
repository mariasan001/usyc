// src/lib/api/api.routes.ts
/**
 * Mapa central de endpoints del backend.
 *
 * Objetivo:
 * - Evitar strings sueltos por el proyecto.
 * - Mantener rutas consistentes y tipadas.
 *
 * Reglas:
 * - Usa funciones cuando haya params (id, códigos, querystrings).
 * - Siempre `encodeURIComponent` en params que viajan en URL.
 *
 * Nota:
 * - Esto NO es el router de Next.js; es solo un “catálogo” de rutas.
 */

export const API = {
  /* ─────────────────────────────────────────
   * Catálogos
   * ───────────────────────────────────────── */
  catalogos: {
    carreras: '/api/catalogos/carreras',
    escolaridades: '/api/catalogos/escolaridades',
    estatusRecibo: '/api/catalogos/estatus-recibo',

    /* Conceptos de pago */
    conceptosPago: '/api/catalogos/conceptos-pago',
    conceptoPagoById: (conceptoId: number) =>
      `/api/catalogos/conceptos-pago/${conceptoId}`,
    conceptoPagoByCodigo: (codigo: string) =>
      `/api/catalogos/conceptos-pago/por-codigo/${encodeURIComponent(codigo)}`,
    conceptoPagoActivar: (conceptoId: number) =>
      `/api/catalogos/conceptos-pago/${conceptoId}/activar`,
    conceptoPagoDesactivar: (conceptoId: number) =>
      `/api/catalogos/conceptos-pago/${conceptoId}/desactivar`,

    /* Tipos de pago */
    tiposPago: '/api/catalogos/tipos-pago',
    tipoPagoById: (id: number) => `/api/catalogos/tipos-pago/${id}`,
    tipoPagoActivar: (id: number) => `/api/catalogos/tipos-pago/${id}/activar`,
    tipoPagoDesactivar: (id: number) =>
      `/api/catalogos/tipos-pago/${id}/desactivar`,

    /* Planteles */
    planteles: '/api/catalogos/planteles',
    plantelById: (id: number) => `/api/catalogos/planteles/${id}`,
  },

  /* ─────────────────────────────────────────
   * Auth (cookie-based)
   * ───────────────────────────────────────── */
  auth: {
    login: '/api/auth/login',
    me: '/api/auth/me',
    logout: '/api/auth/logout',
  },

  /* ─────────────────────────────────────────
   * Alumnos
   * ───────────────────────────────────────── */
  alumnos: {
    base: '/api/alumnos',
    byId: (alumnoId: string) => `/api/alumnos/${encodeURIComponent(alumnoId)}`,
    pagosResumen: (alumnoId: string) =>
      `/api/alumnos/${encodeURIComponent(alumnoId)}/pagos-resumen`,
  },

  /* ─────────────────────────────────────────
   * Recibos
   * ───────────────────────────────────────── */
  recibos: {
    base: '/api/recibos',
    create: '/api/recibos', // POST
    qr: (id: number) => `/api/recibos/${id}/qr`,
    validarQr: (qrPayload: string) =>
      `/api/recibos/validar-qr?qrPayload=${encodeURIComponent(qrPayload)}`,
  },

  /* ─────────────────────────────────────────
   * Auxiliares
   * ───────────────────────────────────────── */
  aux: {
    recibosPreviosCount: '/api/aux/recibos-previos/count',
  },
  
    historico: {
    recibos: '/api/alumnos/filter', // ✅ GET (sin params)
  },

} as const;
