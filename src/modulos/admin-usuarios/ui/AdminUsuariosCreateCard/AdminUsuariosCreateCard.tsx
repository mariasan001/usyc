'use client';

import { useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';

import s from './AdminUsuariosCreateCard.module.css';

import Card from '@/shared/ui/Card/Card';
import Button from '@/shared/ui/Button/Button';

import { usePlanteles } from '@/modulos/configuraciones/hooks';
import { ROLES_UI } from '../../types/admin-usuarios.types';

import type { CrearUsuarioPayload } from '../../types/admin-usuarios.types';

type Props = {
  busy?: boolean;
  onSubmit: (payload: CrearUsuarioPayload) => Promise<void> | void;
};

/**
 * Soporta hooks que expongan `isLoading` o `loading`
 * (para evitar "any" y que el componente sea compatible con ambos estilos).
 */
type LoadingShape = { isLoading?: boolean; loading?: boolean };

function getLoading(x: LoadingShape): boolean {
  if (typeof x.isLoading === 'boolean') return x.isLoading;
  if (typeof x.loading === 'boolean') return x.loading;
  return false;
}

export default function AdminUsuariosCreateCard({ busy, onSubmit }: Props) {
  const plantelesApi = usePlanteles({ soloActivos: true });
  const plantelesLoading = getLoading(plantelesApi as LoadingShape);

  const plantelesOptions = useMemo(
    () =>
      (plantelesApi.items ?? []).map((p) => ({
        value: Number(p.id),
        label: p.name,
      })),
    [plantelesApi.items],
  );

  const [form, setForm] = useState<CrearUsuarioPayload>({
    email: '',
    username: '',
    password: '',
    fullName: '',
    plantelId: 0,
    roleIds: [],
  });

  /**
   * ✅ Solo 1 rol:
   * - backend espera roleIds: number[]
   * - mandamos [] o [id]
   */
  function selectRole(roleId: number) {
    setForm((prev) => ({ ...prev, roleIds: [roleId] }));
  }

  const selectedRoleId = form.roleIds[0] ?? 0;

  return (
    <Card className={s.card}>
      <header className={s.header}>
        <div className={s.titleRow}>
          <UserPlus size={18} />
          <div>
            <div className={s.title}>Crear usuario</div>
            <div className={s.subtitle}>
              Crea un usuario y asígnalo a un plantel con un rol.
            </div>
          </div>
        </div>
      </header>

      <div className={s.grid}>
        <label className={s.field}>
          <span className={s.label}>Email</span>
          <input
            className={s.input}
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="correo@usyc.com"
            autoComplete="email"
          />
        </label>

        <label className={s.field}>
          <span className={s.label}>Usuario</span>
          <input
            className={s.input}
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
            placeholder="usuario"
            autoComplete="username"
          />
        </label>

        <label className={s.fieldWide}>
          <span className={s.label}>Nombre completo</span>
          <input
            className={s.input}
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            placeholder="Nombre Apellido Apellido"
          />
        </label>

        <label className={s.field}>
          <span className={s.label}>Contraseña</span>
          <input
            className={s.input}
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </label>

        <label className={s.field}>
          <span className={s.label}>Plantel</span>
          <select
            className={s.input}
            value={String(form.plantelId)}
            onChange={(e) => setForm((p) => ({ ...p, plantelId: Number(e.target.value) }))}
            disabled={plantelesLoading}
          >
            <option value="0">
              {plantelesLoading ? 'Cargando planteles…' : 'Selecciona un plantel'}
            </option>

            {plantelesOptions.map((x) => (
              <option key={x.value} value={String(x.value)}>
                {x.label}
              </option>
            ))}
          </select>
        </label>

        <div className={s.roles}>
          <div className={s.label}>Rol</div>

          <div className={s.rolesGrid}>
            {ROLES_UI.map((r) => {
              const checked = selectedRoleId === r.roleId;

              return (
                <label key={r.roleId} className={s.roleItem}>
                  <input
                    type="radio"
                    name="rolUsuario"
                    checked={checked}
                    onChange={() => selectRole(r.roleId)}
                    disabled={!!busy}
                  />
                  <span>{r.label}</span>
                </label>
              );
            })}
          </div>

          <div className={s.hint}>
            Solo puedes seleccionar <b>un</b> rol. (Se envía como <code>roleIds: [id]</code>)
          </div>
        </div>
      </div>

      <footer className={s.footer}>
        <Button onClick={() => onSubmit(form)} disabled={!!busy} title="Crear usuario">
          {busy ? 'Creando…' : 'Crear usuario'}
        </Button>
      </footer>
    </Card>
  );
}
