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

/**
 * Helper para armar querystring sin ensuciar los servicios.
 * - Omite null/undefined/''
 * - Convierte todo a string
 *
 * ✅ OJO:
 * - NO hace encode manual (URLSearchParams ya codifica).
 * - Por eso, aquí NO debes mandar valores ya encodeados (evita doble-encode).
 */
function withQuery(
  base: string,
  query: Record<string, string | number | boolean | null | undefined>,
) {
  const sp = new URLSearchParams();

  Object.entries(query).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') return;
    sp.set(k, String(v));
  });

  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

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
    conceptoPagoById: (conceptoId: number) => `/api/catalogos/conceptos-pago/${conceptoId}`,
    conceptoPagoByCodigo: (codigo: string) =>
      `/api/catalogos/conceptos-pago/por-codigo/${encodeURIComponent(codigo)}`,
    conceptoPagoActivar: (conceptoId: number) => `/api/catalogos/conceptos-pago/${conceptoId}/activar`,
    conceptoPagoDesactivar: (conceptoId: number) =>
      `/api/catalogos/conceptos-pago/${conceptoId}/desactivar`,

    /* Tipos de pago */
    tiposPago: '/api/catalogos/tipos-pago',
    tipoPagoById: (id: number) => `/api/catalogos/tipos-pago/${id}`,
    tipoPagoActivar: (id: number) => `/api/catalogos/tipos-pago/${id}/activar`,
    tipoPagoDesactivar: (id: number) => `/api/catalogos/tipos-pago/${id}/desactivar`,

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
    pagosResumen: (alumnoId: string) => `/api/alumnos/${encodeURIComponent(alumnoId)}/pagos-resumen`,
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

    /**
     * ✅ Cancelar recibo
     * - Swagger: POST /api/recibos/{reciboId}/cancelar?motivo=...
     */
    cancelar: (reciboId: number, motivo: string) =>
      `/api/recibos/${reciboId}/cancelar?motivo=${encodeURIComponent(motivo)}`,
  },

  /* ─────────────────────────────────────────
   * Reportes
   * ───────────────────────────────────────── */
  reportes: {
    /**
     * Corte de caja por día.
     * Swagger: GET /api/reportes/corte-caja?fecha=YYYY-MM-DD&plantelId=...
     *
     * ✅ Nota:
     * - No hacemos encodeURIComponent(fecha) porque withQuery/URLSearchParams ya codifica.
     */
    corteCaja: (fecha: string, plantelId?: number | null) =>
      withQuery('/api/reportes/corte-caja', {
        fecha,
        plantelId: plantelId ?? undefined,
      }),
  },

  /* ─────────────────────────────────────────
   * Admin
   * ───────────────────────────────────────── */
  admin: {
    /**
     * Usuarios (Swagger: Admin - Usuarios)
     * - GET  /api/admin/users
     *        Query opcional: plantelId, active, roleCode, q
     * - POST /api/admin/users
     * - POST /api/admin/users/{userId}/password
     */
    usuarios: {
      /**
       * ✅ Listar usuarios con filtros opcionales
       * Swagger:
       * GET /api/admin/users?plantelId=3&active=true&roleCode=ADMIN&q=alfred
       */
      listar: (params?: {
        plantelId?: number;
        active?: boolean;
        roleCode?: string;
        q?: string;
      }) =>
        withQuery('/api/admin/users', {
          plantelId: params?.plantelId,
          active: params?.active,
          roleCode: params?.roleCode,
          q: params?.q,
        }),

      /** ✅ Crear usuario */
      crear: '/api/admin/users',

      /** ✅ Cambiar contraseña */
      cambiarContrasena: (userId: number) =>
        `/api/admin/users/${encodeURIComponent(String(userId))}/password`,
    },
  },

  /* ─────────────────────────────────────────
   * Auxiliares
   * ───────────────────────────────────────── */
  aux: {
    recibosPreviosCount: '/api/aux/recibos-previos/count',
  },
} as const;
