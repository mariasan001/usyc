// src/modulos/corte-caja/services/useCorteCaja.ts
import { api } from '@/lib/api/api.client';
import type { CorteCajaDTO } from '../types/corte-caja.types';

export type CorteCajaRangoQuery = {
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  plantelId?: number | null; // opcional (admin puede mandar null = ALL)
};

/**
 * Service del módulo Corte de Caja.
 * - Mantiene llamadas HTTP fuera de la UI.
 * - Permite testear/aislar.
 *
 * Cambio:
 * - Antes: GET corte por fecha
 * - Ahora: GET corte por rango de fechaPago (+ opcional plantelId)
 */
export const CorteCajaService = {
  /**
   * Obtiene corte de caja por rango (fechaPago) y opcional plantelId.
   * Endpoint: /api/reportes/corte-caja/rango
   */
  getRango: ({ fechaInicio, fechaFin, plantelId }: CorteCajaRangoQuery) => {
    const qs = new URLSearchParams();

    // backend espera estas llaves
    qs.set('fechaInicio', fechaInicio);
    qs.set('fechaFin', fechaFin);

    // plantelId puede omitirse cuando es ALL (admin)
    if (plantelId != null) qs.set('plantelId', String(plantelId));

    return api<CorteCajaDTO>(`/api/reportes/corte-caja/rango?${qs.toString()}`);
  },
};
