import { api } from '@/lib/api/api.client';
import { API } from '@/lib/api/api.routes';
import type { ReciboCanceladoDTO, ReciboCanceladoRow } from '../types/cancelados.types';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function normalizeRow(x: ReciboCanceladoDTO): ReciboCanceladoRow {
  const qr = isNonEmptyString(x.qrPayLoad) ? x.qrPayLoad : '';

  return {
    reciboId: x.reciboId,
    folio: x.folio,
    folioLegacy: x.folioLegacy ?? null,

    fechaEmision: x.fechaEmision,
    fechaPago: x.fechaPago,

    alumnoId: x.alumnoId,
    alumnoNombre: x.alumnoNombre,

    concepto: x.concepto,
    monto: x.monto,
    moneda: x.moneda,

    estatusCodigo: x.estatusCodigo,
    estatusNombre: x.estatusNombre,

    tipoPagoName: x.tipoPagoName ?? null,

    cancelado: Boolean(x.cancelado),
    qrPayload: qr,
  };
}

export const CanceladosService = {
  // ✅ Swagger: POST /api/recibos/{reciboId}/cancelar?motivo=...
  async cancelar(reciboId: number, motivo: string): Promise<ReciboCanceladoRow> {
    const res = await api<ReciboCanceladoDTO>(API.recibos.cancelar(reciboId, motivo), {
      method: 'POST',
    });
    return normalizeRow(res);
  },
};
