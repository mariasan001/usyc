// src/modulos/alumnos/services/alumnos.service.ts
import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import type { Alumno, AlumnoCreate, Page } from '../types/alumno.types';

export type AlumnosListParams = {
  page?: number;
  size?: number;
  sort?: string | string[];
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
  create: (payload: AlumnoCreate) =>
    api<Alumno>(API.alumnos.base, { method: 'POST', body: payload }),

  getById: (alumnoId: string) =>
    api<Alumno>(`${API.alumnos.base}/${encodeURIComponent(alumnoId)}`),

  list: (params?: AlumnosListParams) =>
    api<Page<Alumno>>(`${API.alumnos.base}${qs(params)}`),
};
