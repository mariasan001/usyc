'use client';

// src/modulos/admin-usuarios/hooks/useAdminUsuarios.ts
// Hook de UI para crear usuario y cambiar contraseña.
// - Maneja estados de cargando/error/ok.
// - No hace “seguridad”; eso vive en backend.

import { useCallback, useState } from 'react';
import { AdminUsuariosService } from '../services/admin-usuarios.service';

import type {
  CambiarContrasenaPayload,
  CrearUsuarioPayload,
  UsuarioAdminDTO,
} from '../types/admin-usuarios.types';

function nonEmpty(v: string) {
  return (v ?? '').trim().length > 0;
}

export function useAdminUsuarios() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [ultimoCreado, setUltimoCreado] = useState<UsuarioAdminDTO | null>(null);

  const limpiarMensajes = useCallback(() => {
    setError(null);
    setOk(null);
  }, []);

  const crearUsuario = useCallback(async (payload: CrearUsuarioPayload) => {
    limpiarMensajes();
    setBusy(true);

    try {
      // Validación UI (rápida, la buena vive en backend)
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
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo crear el usuario.';
      setError(msg);
      setUltimoCreado(null);
      return null;
    } finally {
      setBusy(false);
    }
  }, [limpiarMensajes]);

  const cambiarContrasena = useCallback(async (userId: number, payload: CambiarContrasenaPayload) => {
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
      const msg = e instanceof Error ? e.message : 'No se pudo cambiar la contraseña.';
      setError(msg);
      return false;
    } finally {
      setBusy(false);
    }
  }, [limpiarMensajes]);

  return {
    busy,
    error,
    ok,

    ultimoCreado,

    crearUsuario,
    cambiarContrasena,

    limpiarMensajes,
  };
}
