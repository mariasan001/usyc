import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import { qs } from '@/lib/api/api.qs';

import type { Alumno, AlumnoCreate, AlumnoUpdate, Page } from '../types/alumno.types';
import type { RecibosPreviosCountResponse } from '../types/recibos-previos.types';

export type AlumnosListParams = {
  page?: number;            // 0-based
  size?: number;            // ej 20
  sort?: string | string[]; // ej "nombreCompleto,asc" o ["nombreCompleto,asc","matricula,desc"]
};

export const AlumnosService = {
  // POST /api/alumnos
  create: (payload: AlumnoCreate) =>
    api<Alumno>(API.alumnos.base, { method: 'POST', body: payload }),

  // GET /api/alumnos/{alumnoId}
  getById: (alumnoId: string) =>
    api<Alumno>(API.alumnos.byId(alumnoId)),

  /**
   * ✅ PUT /api/alumnos/update/{alumnoId}
   * Actualiza la información del alumno (sin cambiar alumno_id).
   */
  update: (alumnoId: string, payload: AlumnoUpdate) =>
    api<Alumno>(API.alumnos.update(alumnoId), { method: 'PUT', body: payload }),

  // GET /api/alumnos?page=0&size=20&sort=...
  list: (params?: AlumnosListParams) => {
    const safe: AlumnosListParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sort: params?.sort,
    };

    return api<Page<Alumno>>(`${API.alumnos.base}${qs(safe)}`);
  },

  // GET /api/aux/recibos-previos/count?nombre=...
  countRecibosPreviosByNombre: (nombreCompleto: string) =>
    api<RecibosPreviosCountResponse>(
      `${API.aux.recibosPreviosCount}${qs({ nombre: nombreCompleto })}`,
    ),
} as const;
