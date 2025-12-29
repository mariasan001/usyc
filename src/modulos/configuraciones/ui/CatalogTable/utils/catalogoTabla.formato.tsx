// src/modulos/configuraciones/ui/catalogo-tabla/utils/catalogoTabla.formato.tsx
import { CheckCircle2, XCircle } from 'lucide-react';
import type { FilaCatalogo } from '../types/catalogoTabla.types';
import { filaActiva } from './catalogoTabla.filas';

/**
 * Renderiza el valor de una celda.
 * - Para activo/active muestra badge con icono.
 * - Para montos formatea como moneda MXN.
 * - Para vacíos muestra "—".
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

  if (value === null || value === undefined || value === '') return '—';

  if (typeof value === 'number' && /monto|mensual|inscripcion/i.test(key)) {
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
