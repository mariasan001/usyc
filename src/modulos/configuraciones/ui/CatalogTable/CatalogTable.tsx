// src/modulos/configuraciones/ui/CatalogTable/CatalogTable.tsx
'use client';

import { Edit3, RefreshCw, Power, CheckCircle2, XCircle } from 'lucide-react';
import s from './CatalogTable.module.css';

type CatalogRowLike = Record<string, unknown> & {
  id?: number | string;

  // español
  codigo?: string;
  nombre?: string;
  activo?: boolean;

  // carreras
  carreraId?: string;

  // conceptos pago
  conceptoId?: number;
  tipoMonto?: string;

  // swagger
  code?: string;
  name?: string;
  address?: string;
  active?: boolean;

  // carreras extras
  escolaridadNombre?: string;
  montoMensual?: number;
  montoInscripcion?: number;
  duracionAnios?: number;
  duracionMeses?: number;
};

function hasDefined(it: CatalogRowLike, key: keyof CatalogRowLike) {
  return Object.prototype.hasOwnProperty.call(it, key) && it[key] !== undefined;
}
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  // por si tu api.client lanza objetos tipo { message: '...' }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }

  // por si lanza string directo
  if (typeof error === 'string' && error.trim()) return error;

  return 'Error desconocido';
}

function guessColumns(item: CatalogRowLike) {
  // ✅ 1) Conceptos (más específico)
  if (hasDefined(item, 'conceptoId')) {
    const cols = ['codigo', 'nombre', 'tipoMonto'];
    if (hasDefined(item, 'activo')) cols.push('activo');
    return cols;
  }

  // ✅ 2) Carreras
  if (hasDefined(item, 'carreraId')) {
    const cols = [
      'carreraId',
      'nombre',
      'escolaridadNombre',
      'montoMensual',
      'montoInscripcion',
      'duracionAnios',
      'duracionMeses',
    ];
    if (hasDefined(item, 'activo')) cols.push('activo');
    return cols;
  }

  // ✅ 3) Español (Escolaridades / EstatusRecibo)
  if (hasDefined(item, 'codigo')) {
    const cols = ['codigo', 'nombre'];
    // EstatusRecibo no trae activo -> no lo pintes si no existe
    if (hasDefined(item, 'activo')) cols.push('activo');
    return cols;
  }

  // ✅ 4) Swagger Planteles
  if (hasDefined(item, 'address')) {
    const cols = ['code', 'name', 'address'];
    if (hasDefined(item, 'active')) cols.push('active');
    return cols;
  }

  // ✅ 5) Swagger TiposPago
  if (hasDefined(item, 'code')) {
    const cols = ['code', 'name'];
    if (hasDefined(item, 'active')) cols.push('active');
    return cols;
  }

  // fallback
  return Object.keys(item).slice(0, 4);
}

function rowKey(it: CatalogRowLike): string {
  const k = it.id ?? it.conceptoId ?? it.code ?? it.codigo ?? it.carreraId;
  return String(k ?? Math.random());
}

function titleCaseHeader(key: string) {
  const map: Record<string, string> = {
    codigo: 'Código',
    nombre: 'Nombre',
    activo: 'Activo',

    code: 'Código',
    name: 'Nombre',
    address: 'Dirección',
    active: 'Activo',

    carreraId: 'ID',
    escolaridadNombre: 'Escolaridad',
    montoMensual: 'Mensualidad',
    montoInscripcion: 'Inscripción',
    duracionAnios: 'Años',
    duracionMeses: 'Meses',

    tipoMonto: 'Tipo de monto',
  };

  return (
    map[key] ??
    key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (m) => m.toUpperCase())
  );
}

function isActiveRow(it: CatalogRowLike) {
  return Boolean((it.active ?? it.activo) === true);
}

function hasActiveField(it: CatalogRowLike) {
  // ✅ Solo consideramos “toggeable” si viene alguno
  return hasDefined(it, 'active') || hasDefined(it, 'activo');
}

function renderCellValue(key: string, v: unknown, it: CatalogRowLike) {
  if (key === 'activo' || key === 'active') {
    const ok = isActiveRow(it);
    return (
      <span className={`${s.badge} ${ok ? s.badgeOk : s.badgeOff}`}>
        {ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
        {ok ? 'Activo' : 'Inactivo'}
      </span>
    );
  }

  if (v === null || v === undefined || v === '') return '—';

  if (typeof v === 'number' && /monto|mensual|inscripcion/i.test(key)) {
    try {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(v);
    } catch {
      return String(v);
    }
  }

  return String(v);
}

export default function CatalogTable({
  title,
  items,
  isLoading,
  isSaving,
  error,
  onReload,
  onEdit,
  onToggleActive,
  canToggleActive,
}: {
  title: string;
  items: CatalogRowLike[];
  isLoading?: boolean;
  isSaving?: boolean;
  error?: unknown;
  onReload: () => void;
  onEdit: (item: CatalogRowLike) => void;

  // ✅ opcional
  onToggleActive?: (item: CatalogRowLike) => void | Promise<void>;
  canToggleActive?: (item: CatalogRowLike) => boolean;
}) {
  const cols = items[0] ? guessColumns(items[0]) : [];

  // ✅ Power existe solo si hay handler
  const showPower = Boolean(onToggleActive);

  return (
    <section className={s.card}>
      <header className={s.cardHeader}>
        <div className={s.headLeft}>
          <h2 className={s.h2}>{title}</h2>
          <div className={s.meta}>
            {isLoading ? 'Cargando…' : `${items.length} registros`}
            {isSaving ? ' · Guardando…' : ''}
          </div>
        </div>

        <div className={s.headerActions}>
          <button className={s.btnGhost} onClick={onReload} disabled={isLoading} type="button">
            <RefreshCw size={16} />
            Recargar
          </button>
        </div>
      </header>

      {error ? (
        <div className={s.error}>
          <div className={s.errorTitle}>Ocurrió un error</div>
          <div className={s.errorText}>{getErrorMessage(error)}</div>
        </div>
      ) : null}


      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{titleCaseHeader(c)}</th>
              ))}
              <th className={s.thActions}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={cols.length + 1} className={s.stateCell}>
                  Cargando…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={cols.length + 1} className={s.stateCell}>
                  Sin registros
                </td>
              </tr>
            ) : (
              items.map((it) => {
                const active = isActiveRow(it);

                // ✅ Si no trae active/activo, ni aunque exista handler pintamos el power
                const rowSupportsToggle = showPower && hasActiveField(it);

                const allowToggle =
                  rowSupportsToggle && (canToggleActive ? canToggleActive(it) : true);

                return (
                  <tr key={rowKey(it)}>
                    {cols.map((c) => (
                      <td
                        key={c}
                        className={
                          c === 'nombre' || c === 'name'
                            ? s.tdStrong
                            : c === 'address'
                              ? s.tdMuted
                              : ''
                        }
                      >
                        {renderCellValue(c, it[c], it)}
                      </td>
                    ))}

                    <td className={s.actions}>
                      <button
                        className={s.iconBtn}
                        onClick={() => onEdit(it)}
                        disabled={isSaving}
                        type="button"
                        title="Editar"
                        aria-label="Editar"
                      >
                        <Edit3 size={16} />
                      </button>

                      {allowToggle ? (
                        <button
                          className={`${s.iconBtn} ${active ? s.iconDanger : s.iconOk}`}
                          onClick={() => onToggleActive?.(it)}
                          disabled={isSaving}
                          type="button"
                          title={active ? 'Desactivar' : 'Activar'}
                          aria-label={active ? 'Desactivar' : 'Activar'}
                        >
                          <Power size={16} />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
