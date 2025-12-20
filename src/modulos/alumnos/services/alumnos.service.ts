// src/modulos/alumnos/services/alumnos.service.ts
import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import type { Alumno, AlumnoCreate, Page } from '../types/alumno.types';

export type AlumnosListParams = {
  page?: number;            // 0-based
  size?: number;            // ej 20
  sort?: string | string[]; // ej "nombreCompleto,asc" o ["nombreCompleto,asc","matricula,desc"]
};

function qs(params?: Record<string, any>) {
  const sp = new URLSearchParams();
  if (!params) return '';

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)));
    else sp.set(k, String(v));
  });

  const q = sp.toString();
  return q ? `?${q}` : '';
}

export const AlumnosService = {
  // POST /api/alumnos
  create: (payload: AlumnoCreate) =>
    api<Alumno>(API.alumnos.base, { method: 'POST', body: payload }),

  // GET /api/alumnos/{alumnoId}
  getById: (alumnoId: string) =>
    api<Alumno>(`${API.alumnos.base}/${encodeURIComponent(alumnoId)}`),

  // GET /api/alumnos?page=0&size=20&sort=nombreCompleto,asc
  list: (params?: AlumnosListParams) => {
    const safe: AlumnosListParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sort: params?.sort,
    };

    return api<Page<Alumno>>(`${API.alumnos.base}${qs(safe)}`);
  },
};
