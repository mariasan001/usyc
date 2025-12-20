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

  // tipos de pago / planteles (swagger)
  code?: string;
  name?: string;
  address?: string;
  active?: boolean;
};

function guessColumns(item: CatalogRowLike) {
  // PLANTELES (code + name + address + active)
  if ('address' in item) return ['code', 'name', 'address', 'active'];

  // TIPOS DE PAGO
  if ('code' in item) return ['code', 'name', 'active'];

  // CONCEPTOS PAGO
  if ('conceptoId' in item) return ['codigo', 'nombre', 'tipoMonto', 'activo'];

  // ESCOLARIDADES / ESTATUS
  if ('codigo' in item) return ['codigo', 'nombre', 'activo'];

  // CARRERAS
  if ('carreraId' in item)
    return [
      'carreraId',
      'nombre',
      'escolaridadNombre',
      'montoMensual',
      'montoInscripcion',
      'duracionAnios',
      'duracionMeses',
      'activo',
    ];

  return Object.keys(item).slice(0, 4);
}

function rowKey(it: CatalogRowLike): string {
  const k = it.id ?? it.conceptoId ?? it.code ?? it.codigo ?? it.carreraId;
  return String(k ?? crypto.randomUUID());
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
  return Boolean(it.active ?? it.activo);
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

  if (v === null || v === undefined) return '—';

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
}: {
  title: string;
  items: CatalogRowLike[];
  isLoading?: boolean;
  isSaving?: boolean;
  error?: unknown;
  onReload: () => void;
  onEdit: (item: CatalogRowLike) => void;
  onToggleActive: (item: CatalogRowLike) => void;
}) {
  const cols = items[0] ? guessColumns(items[0]) : [];

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
          <button
            className={s.btnGhost}
            onClick={onReload}
            disabled={isLoading}
            type="button"
          >
            <RefreshCw size={16} />
            Recargar
          </button>
        </div>
      </header>

      {error ? (
        <div className={s.error}>
          <div className={s.errorTitle}>Ocurrió un error</div>
          <div className={s.errorText}>
            {String((error as any)?.message ?? 'Error desconocido')}
          </div>
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

                      <button
                        className={`${s.iconBtn} ${
                          active ? s.iconDanger : s.iconOk
                        }`}
                        onClick={() => onToggleActive(it)}
                        disabled={isSaving}
                        type="button"
                        title={active ? 'Desactivar' : 'Activar'}
                        aria-label={active ? 'Desactivar' : 'Activar'}
                      >
                        <Power size={16} />
                      </button>
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
