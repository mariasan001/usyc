// src/modulos/configuraciones/ui/catalogo-tabla/utils/catalogoTabla.formato.tsx
import { CheckCircle2, XCircle } from 'lucide-react';
import type { FilaCatalogo } from '../types/catalogoTabla.types';
import { filaActiva } from './catalogoTabla.filas';

/**
 * Renderiza el valor de una celda.
 * - Para activo/active muestra badge con icono.
 * - Para montos formatea como moneda MXN.
 * - Para vacíos muestra "—".
 * - Para carreras: "conceptos" (array) muestra resumen legible.
 */
export function renderValorCelda(args: {
  key: string;
  value: unknown;
  fila: FilaCatalogo;
  clases: {
    badge: string;
    badgeOk: string;
    badgeOff: string;
  };
}): React.ReactNode {
  const { key, value, fila, clases } = args;

  if (key === 'activo' || key === 'active') {
    const ok = filaActiva(fila);
    return (
      <span className={`${clases.badge} ${ok ? clases.badgeOk : clases.badgeOff}`}>
        {ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
        {ok ? 'Activo' : 'Inactivo'}
      </span>
    );
  }

  // ✅ Carreras: conceptos viene como arreglo (resumen)
  if (key === 'conceptos') {
    if (!Array.isArray(value) || value.length === 0) return '—';

    // Intentamos armar un resumen sin asumir demasiado del shape
    const resumen = value
      .slice(0, 2)
      .map((x) => {
        const obj = (x ?? {}) as Record<string, unknown>;
        const nombre = typeof obj.conceptoNombre === 'string' ? obj.conceptoNombre : '';
        const codigo = typeof obj.conceptoCodigo === 'string' ? obj.conceptoCodigo : '';
        if (nombre && codigo) return `${nombre} (${codigo})`;
        if (nombre) return nombre;
        if (codigo) return codigo;
        const id = obj.conceptoId;
        return id !== undefined ? `ID ${String(id)}` : 'Concepto';
      })
      .join(' · ');

    const extra = value.length > 2 ? ` +${value.length - 2}` : '';
    return `${resumen}${extra}`;
  }

  if (value === null || value === undefined || value === '') return '—';

  // ✅ Montos: incluye totalProyectado además del patrón actual
  if (
    typeof value === 'number' &&
    (/monto|mensual|inscripcion|totalProyectado/i.test(key) || key === 'totalProyectado')
  ) {
    try {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}
