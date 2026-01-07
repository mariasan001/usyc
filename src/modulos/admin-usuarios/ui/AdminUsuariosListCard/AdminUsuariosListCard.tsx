'use client';

import { useMemo, useState } from 'react';
import { RefreshCcw, Search, Filter } from 'lucide-react';
import clsx from 'clsx';

import s from './AdminUsuariosListCard.module.css';

import type { AdminUsuariosListParams, UsuarioAdminDTO } from '../../types/admin-usuarios.types';

type Props = {
  items: UsuarioAdminDTO[];
  loading: boolean;
  error: string | null;

  params: AdminUsuariosListParams;
  onChangeParams: (next: AdminUsuariosListParams) => void;

  onReload: () => void;
};

type ActiveUI = 'all' | 'true' | 'false';

function toActiveUI(v: AdminUsuariosListParams['active']): ActiveUI {
  if (v === true) return 'true';
  if (v === false) return 'false';
  return 'all';
}

function fromActiveUI(v: ActiveUI): AdminUsuariosListParams['active'] {
  if (v === 'true') return true;
  if (v === 'false') return false;
  return undefined;
}

function safeNumber(v: string): number | undefined {
  const t = v.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function formatIso(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export default function AdminUsuariosListCard({
  items,
  loading,
  error,
  params,
  onChangeParams,
  onReload,
}: Props) {
  // UI local para no spamear reload en cada tecla
  const [q, setQ] = useState(params.q ?? '');
  const [roleCode, setRoleCode] = useState(params.roleCode ?? '');
  const [plantelId, setPlantelId] = useState(params.plantelId ? String(params.plantelId) : '');
  const [active, setActive] = useState<ActiveUI>(toActiveUI(params.active));

  const resumen = useMemo(() => {
    const total = items.length;
    const activos = items.filter((u) => u.active).length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [items]);

  function aplicarFiltros() {
    onChangeParams({
      ...params,
      q: q.trim() || undefined,
      roleCode: roleCode.trim() || undefined,
      plantelId: safeNumber(plantelId),
      active: fromActiveUI(active),
    });
  }

  function limpiarFiltros() {
    setQ('');
    setRoleCode('');
    setPlantelId('');
    setActive('all');
    onChangeParams({
      ...params,
      q: undefined,
      roleCode: undefined,
      plantelId: undefined,
      active: undefined,
    });
  }

  return (
    <section className={s.card} aria-busy={loading ? 'true' : 'false'}>
      <header className={s.head}>
        <div>
          <div className={s.title}>Usuarios</div>
          <div className={s.sub}>
            Total: <b>{resumen.total}</b> · Activos: <b>{resumen.activos}</b> · Inactivos:{' '}
            <b>{resumen.inactivos}</b>
          </div>
        </div>

        <div className={s.actions}>
          <button
            type="button"
            className={clsx(s.btn, s.btnSoft)}
            onClick={onReload}
            disabled={loading}
            title="Refrescar"
          >
            <RefreshCcw size={16} />
            Refrescar
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className={s.filters}>
        <div className={s.filterField}>
          <label>Plantel</label>
          <input
            value={plantelId}
            onChange={(e) => setPlantelId(e.target.value)}
            placeholder="plantelId (ej. 3)"
            inputMode="numeric"
          />
        </div>

        <div className={s.filterField}>
          <label>Activo</label>
          <select value={active} onChange={(e) => setActive(e.target.value as ActiveUI)}>
            <option value="all">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        <div className={s.filterField}>
          <label>Rol</label>
          <input
            value={roleCode}
            onChange={(e) => setRoleCode(e.target.value)}
            placeholder="roleCode (ej. ADMIN)"
          />
        </div>

        <div className={s.filterFieldWide}>
          <label>Búsqueda</label>
          <div className={s.searchWrap}>
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="username / email / fullName / alumnoId…"
            />
          </div>
        </div>

        <div className={s.filterBtns}>
          <button type="button" className={clsx(s.btn, s.btnPrimary)} onClick={aplicarFiltros}>
            <Filter size={16} />
            Aplicar
          </button>

          <button type="button" className={clsx(s.btn, s.btnGhost)} onClick={limpiarFiltros}>
            Limpiar
          </button>
        </div>
      </div>

      {error ? <div className={s.alertError}>{error}</div> : null}

      {/* Tabla */}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Plantel</th>
              <th>Activo</th>
              <th>Roles</th>
              <th>Último login</th>
              <th>Creado</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className={s.skelRow}>
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j}>
                        <span className={s.skel} />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className={s.empty}>
                  No hay usuarios con esos filtros.
                </td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u.userId}>
                  <td className={s.mono}>{u.userId}</td>
                  <td className={s.mono}>{u.username || '—'}</td>
                  <td>{u.fullName || '—'}</td>
                  <td className={s.mono}>{u.email || '—'}</td>
                  <td className={s.mono}>{u.plantelId ?? '—'}</td>
                  <td>
                    <span className={clsx(s.badge, u.active ? s.badgeOk : s.badgeOff)}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={s.rolesCell}>
                    {(u.roles ?? []).length ? (u.roles ?? []).join(', ') : '—'}
                  </td>
                  <td className={s.mono}>{formatIso(u.lastLoginAt)}</td>
                  <td className={s.mono}>{formatIso(u.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
