'use client';

import s from './CatalogTable.module.css';

type CatalogRowLike = Record<string, unknown> & {
  id?: number | string;

  // español (lo que ya tienes en escolaridades/estatus/conceptos)
  codigo?: string;
  nombre?: string;
  activo?: boolean;

  // carreras
  carreraId?: string;

  // conceptos pago (tú usas conceptoId para detectarlo)
  conceptoId?: number;

  // ✅ tipos de pago (swagger)
  code?: string;
  name?: string;
  active?: boolean;
};

function guessColumns(item: CatalogRowLike) {
  // ✅ TIPOS DE PAGO (swagger trae code/name/active)
  if ('code' in item) return ['code', 'name', 'active'];

  // CONCEPTOS PAGO
  if ('conceptoId' in item) return ['codigo', 'nombre', 'tipoMonto', 'activo'];

  // Escolaridades / Estatus suelen traer codigo+nombre
  if ('codigo' in item) return ['codigo', 'nombre', 'activo'];

  // Carreras (tu shape actual)
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

  // fallback
  return Object.keys(item).slice(0, 4);
}

function rowKey(it: CatalogRowLike): string {
  // ✅ prioridad: id -> conceptoId -> code -> codigo -> carreraId
  const k = it.id ?? it.conceptoId ?? it.code ?? it.codigo ?? it.carreraId;
  return String(k ?? crypto.randomUUID());
}

function renderCellValue(v: unknown) {
  if (typeof v === 'boolean') return v ? 'Sí' : 'No';
  if (v === null || v === undefined) return '';
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
                <tr key={rowKey(it)}>
                  {cols.map((c) => (
                    <td key={c}>{renderCellValue(it[c])}</td>
                  ))}

                  <td className={s.actions}>
                    <button className={s.link} onClick={() => onEdit(it)} disabled={isSaving}>
                      Editar
                    </button>

                    {/* ✅ Para tipos-pago, el boolean se llama active, no activo */}
                    <button
                      className={s.linkDanger}
                      onClick={() => onToggleActive(it)}
                      disabled={isSaving}
                      title={
                        (it.active ?? it.activo) ? 'Desactivar' : 'Activar'
                      }
                    >
                      {(it.active ?? it.activo) ? 'Desactivar' : 'Activar'}
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
