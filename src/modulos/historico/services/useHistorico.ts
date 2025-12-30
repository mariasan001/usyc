import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import type { ReciboHistoricoDTO } from '../types/historico.types';

export const HistoricoService = {
  // GET /api/alumnos/filter
  list: () => api<ReciboHistoricoDTO[]>(API.historico.recibos),
};
