// src/modulos/configuraciones/ui/catalogo-tabla/CatalogoTabla.tsx
'use client';

import { Edit3, RefreshCw, Power } from 'lucide-react';
import s from './CatalogTable.module.css';

import type { CatalogoTablaProps } from './types/catalogoTabla.types';

import { getMensajeError, tituloColumna } from './utils/catalogoTabla.texto';
import { adivinarColumnas } from './utils/catalogoTabla.columnas';
import { filaActiva, keyFila, soportaToggleActivo } from './utils/catalogoTabla.filas';
import { renderValorCelda } from './utils/catalogoTabla.formato';

/**
 * Tabla genérica de catálogos.
 * - Renderiza columnas “inteligentes” según el primer item.
 * - Permite editar y (opcional) activar/desactivar.
 * - Sin librerías extra, TS estricto, comportamiento incremental.
 */
export default function CatalogoTabla({
  title,
  items,
  isLoading,
  isSaving,
  error,
  onReload,
  onEdit,
  onToggleActive,
  canToggleActive,
}: CatalogoTablaProps) {
  const cols = items[0] ? adivinarColumnas(items[0]) : [];

  // Power solo existe si hay handler
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
          <div className={s.errorText}>{getMensajeError(error)}</div>
        </div>
      ) : null}

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{tituloColumna(c)}</th>
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
                const active = filaActiva(it);

                // Si no trae active/activo, ni aunque exista handler pintamos el power
                const rowSupportsToggle = showPower && soportaToggleActivo(it);

                const allowToggle =
                  rowSupportsToggle && (canToggleActive ? canToggleActive(it) : true);

                return (
                  <tr key={keyFila(it)}>
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
                        {renderValorCelda({
                          key: c,
                          value: it[c],
                          fila: it,
                          clases: {
                            badge: s.badge,
                            badgeOk: s.badgeOk,
                            badgeOff: s.badgeOff,
                          },
                        })}
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
