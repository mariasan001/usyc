'use client';

// src/modulos/admin-usuarios/hooks/useAdminUsuarios.ts
// Hook de UI para:
// - Crear usuario
// - Cambiar contraseña
// - Listar usuarios (GET /api/admin/users con filtros)
//
// Nota:
// - La seguridad REAL la impone el backend.
// - Aquí solo cuidamos UX/estado/validación ligera.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminUsuariosService } from '../services/admin-usuarios.service';

import type {
  AdminUsuariosListParams,
  CambiarContrasenaPayload,
  CrearUsuarioPayload,
  UsuarioAdminDTO,
} from '../types/admin-usuarios.types';

function nonEmpty(v: string) {
  return (v ?? '').trim().length > 0;
}

function toMsg(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

export function useAdminUsuarios(options?: { autoLoad?: boolean }) {
  // ─────────────────────────────────────────
  // Mensajes globales (acciones)
  // ─────────────────────────────────────────
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [ultimoCreado, setUltimoCreado] = useState<UsuarioAdminDTO | null>(null);

  const limpiarMensajes = useCallback(() => {
    setError(null);
    setOk(null);
  }, []);

  // ─────────────────────────────────────────
  // Listado de usuarios (nuevo)
  // ─────────────────────────────────────────
  const [usuarios, setUsuarios] = useState<UsuarioAdminDTO[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // filtros opcionales (Swagger: plantelId, active, roleCode, q)
  const [listParams, setListParams] = useState<AdminUsuariosListParams>({
    // default sugerido (puedes cambiarlo)
    active: true,
  });

  const listarUsuarios = useCallback(
    async (override?: AdminUsuariosListParams) => {
      setListLoading(true);
      setListError(null);

      try {
        const params = override ?? listParams;
        const data = await AdminUsuariosService.listar(params);

        setUsuarios(Array.isArray(data) ? data : []);
        return data;
      } catch (e) {
        const msg = toMsg(e, 'No se pudo listar usuarios.');
        setListError(msg);
        setUsuarios([]);
        return null;
      } finally {
        setListLoading(false);
      }
    },
    [listParams],
  );

  // Autoload opcional (si abres la pantalla y quieres que cargue sola)
  useEffect(() => {
    if (!options?.autoLoad) return;
    void listarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.autoLoad]);

  // ─────────────────────────────────────────
  // Crear usuario (igual, pero con toMsg)
  // ─────────────────────────────────────────
  const crearUsuario = useCallback(
    async (payload: CrearUsuarioPayload) => {
      limpiarMensajes();
      setBusy(true);

      try {
        // Validación UI (rápida)
        if (!nonEmpty(payload.email)) throw new Error('Email es requerido.');
        if (!nonEmpty(payload.username)) throw new Error('Usuario es requerido.');
        if (!nonEmpty(payload.fullName)) throw new Error('Nombre completo es requerido.');
        if (!nonEmpty(payload.password)) throw new Error('Contraseña es requerida.');
        if (!Number.isFinite(payload.plantelId) || payload.plantelId <= 0)
          throw new Error('Selecciona un plantel válido.');
        if (!Array.isArray(payload.roleIds) || payload.roleIds.length === 0)
          throw new Error('Debes seleccionar al menos 1 rol.');

        const res = await AdminUsuariosService.crear(payload);

        setUltimoCreado(res);
        setOk('Usuario creado correctamente.');

        // ✅ opcional: refrescar listado si ya estás usando la tabla
        // (no estorba si no lo renderizas)
        void listarUsuarios();

        return res;
      } catch (e) {
        const msg = toMsg(e, 'No se pudo crear el usuario.');
        setError(msg);
        setUltimoCreado(null);
        return null;
      } finally {
        setBusy(false);
      }
    },
    [limpiarMensajes, listarUsuarios],
  );

  // ─────────────────────────────────────────
  // Cambiar contraseña (igual, pero con toMsg)
  // ─────────────────────────────────────────
  const cambiarContrasena = useCallback(
    async (userId: number, payload: CambiarContrasenaPayload) => {
      limpiarMensajes();
      setBusy(true);

      try {
        if (!Number.isFinite(userId) || userId <= 0) throw new Error('userId inválido.');
        if (!nonEmpty(payload.currentPassword)) throw new Error('La contraseña actual es requerida.');
        if (!nonEmpty(payload.newPassword)) throw new Error('La nueva contraseña es requerida.');
        if (payload.newPassword.trim().length < 6) throw new Error('La nueva contraseña es muy corta.');

        await AdminUsuariosService.cambiarContrasena(userId, payload);
        setOk('Contraseña actualizada.');
        return true;
      } catch (e) {
        const msg = toMsg(e, 'No se pudo cambiar la contraseña.');
        setError(msg);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [limpiarMensajes],
  );

  // ─────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────
  return {
    // acciones existentes
    busy,
    error,
    ok,
    ultimoCreado,
    crearUsuario,
    cambiarContrasena,
    limpiarMensajes,

    // ✅ listado (nuevo)
    usuarios,
    listLoading,
    listError,
    listParams,
    setListParams,
    listarUsuarios,
  };
}
