// src/modules/configuraciones/catalogos/ui/CatalogTable/CatalogTable.tsx
'use client';

import s from './CatalogTable.module.css';

function guessColumns(item: any) {
  // columnas “smart”: ajusta si quieres
  if ('codigo' in item) return ['codigo', 'nombre', 'activo'];
  if ('carreraId' in item) return ['carreraId', 'nombre', 'escolaridadNombre', 'montoMensual', 'montoInscripcion', 'duracionAnios', 'duracionMeses', 'activo'];
  return Object.keys(item).slice(0, 4);
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
  items: any[];
  isLoading?: boolean;
  isSaving?: boolean;
  error?: unknown;
  onReload: () => void;
  onEdit: (item: any) => void;
  onToggleActive: (item: any) => void;
}) {
  const cols = items[0] ? guessColumns(items[0]) : [];

  return (
    <div className={s.card}>
      <div className={s.cardHeader}>
        <h2 className={s.h2}>{title}</h2>

        <div className={s.headerActions}>
          <button className={s.secondary} onClick={onReload} disabled={isLoading}>
            Recargar
          </button>
        </div>
      </div>

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
                <th key={c}>{c}</th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={cols.length + 1} className={s.loading}>
                  Cargando…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={cols.length + 1} className={s.empty}>
                  Sin registros
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.id ?? it.codigo ?? it.carreraId}>
                  {cols.map((c) => (
                    <td key={c}>
                      {typeof it[c] === 'boolean' ? (it[c] ? 'Sí' : 'No') : String(it[c] ?? '')}
                    </td>
                  ))}
                  <td className={s.actions}>
                    <button className={s.link} onClick={() => onEdit(it)} disabled={isSaving}>
                      Editar
                    </button>
                    <button
                      className={s.linkDanger}
                      onClick={() => onToggleActive(it)}
                      disabled={isSaving}
                      title={it.activo ? 'Desactivar' : 'Activar'}
                    >
                      {it.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
