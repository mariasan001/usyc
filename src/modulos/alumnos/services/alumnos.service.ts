import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import { Alumno, AlumnoCreate } from '../types/alumno.types';

export const AlumnosService = {
  // POST /api/alumnos
  create: (payload: AlumnoCreate) =>
    api<Alumno>(API.alumnos.base, { method: 'POST', body: payload }),

  // GET /api/alumnos/{alumnoId}
  getById: (alumnoId: string) =>
    api<Alumno>(`${API.alumnos.base}/${encodeURIComponent(alumnoId)}`),
};
