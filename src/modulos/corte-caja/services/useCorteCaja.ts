// src/modulos/corte-caja/services/useCorteCaja.ts
import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import type { CorteCajaDTO } from '../types/corte-caja.types';

export type CorteCajaQuery = {
  fecha: string; // YYYY-MM-DD
  plantelId?: number | null; // opcional
};

/**
 * Service del módulo Corte de Caja.
 * - Mantiene llamadas HTTP fuera de la UI.
 * - Permite testear/aislar.
 */
export const CorteCajaService = {
  /**
   * Obtiene corte de caja por fechaPago (y opcionalmente plantelId).
   */
  get: ({ fecha, plantelId }: CorteCajaQuery) => api<CorteCajaDTO>(API.reportes.corteCaja(fecha, plantelId ?? null)),
};
