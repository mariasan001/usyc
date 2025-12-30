import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import type { AlumnoPagosResumenDTO } from '../ui/AlumnoDrawer/types/alumno-pagos-resumen.types';

export const AlumnosPagosService = {
  // GET /api/alumnos/{alumnoId}/pagos-resumen
  getResumen: (alumnoId: string) =>
    api<AlumnoPagosResumenDTO>(API.alumnos.pagosResumen(alumnoId)),
};
