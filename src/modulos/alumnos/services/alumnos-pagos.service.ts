import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import { AlumnoPagosResumen } from '../ui/AlumnoDrawer/types/alumno-pagos-resumen.types';

export const AlumnosPagosService = {
  // GET /api/alumnos/{alumnoId}/pagos-resumen
  getPagosResumen: (alumnoId: string) =>
    api<AlumnoPagosResumen>(API.alumnos.pagosResumen(alumnoId)),
};
