'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';

import s from './AdminUsuariosPasswordCard.module.css';

import Card from '@/shared/ui/Card/Card';
import Button from '@/shared/ui/Button/Button';

import type { CambiarContrasenaPayload } from '../../types/admin-usuarios.types';

type Props = {
  busy?: boolean;
  onSubmit: (userId: number, payload: CambiarContrasenaPayload) => Promise<void> | void;
};

export default function AdminUsuariosPasswordCard({ busy, onSubmit }: Props) {
  const [userId, setUserId] = useState<number>(0);
  const [form, setForm] = useState<CambiarContrasenaPayload>({
    currentPassword: '',
    newPassword: '',
  });

  return (
    <Card className={s.card}>
      <header className={s.header}>
        <div className={s.titleRow}>
          <KeyRound size={18} />
          <div>
            <div className={s.title}>Cambiar contraseña</div>
            <div className={s.subtitle}>Actualiza la contraseña validando la actual (según Swagger).</div>
          </div>
        </div>
      </header>

      <div className={s.grid}>
        <label className={s.field}>
          <span className={s.label}>userId</span>
          <input
            className={s.input}
            value={userId ? String(userId) : ''}
            onChange={(e) => setUserId(Number(e.target.value || 0))}
            placeholder="10"
            inputMode="numeric"
          />
        </label>

        <label className={s.field}>
          <span className={s.label}>Contraseña actual</span>
          <input
            className={s.input}
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        <label className={s.field}>
          <span className={s.label}>Nueva contraseña</span>
          <input
            className={s.input}
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </label>
      </div>

      <footer className={s.footer}>
        <Button onClick={() => onSubmit(userId, form)} disabled={!!busy} title="Actualizar contraseña">
          {busy ? 'Actualizando…' : 'Actualizar contraseña'}
        </Button>
      </footer>
    </Card>
  );
}
