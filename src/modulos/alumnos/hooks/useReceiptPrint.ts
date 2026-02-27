'use client';

import { useEffect, useMemo, useState } from 'react';

import { AlumnosPagosService } from '@/modulos/alumnos/services/alumnos-pagos.service';
import { RecibosService } from '@/modulos/alumnos/services/recibos.service';

import type {
  AlumnoPagosResumenDTO,
  PagoRealDTO,
} from '@/modulos/alumnos/ui/AlumnoDrawer/types/alumno-pagos-resumen.types';

import type { ReceiptPrint } from '@/modules/receipts/ui/ReceiptDocument/ReceiptDocument';
import type { ReciboDTO } from '@/modulos/alumnos/ui/AlumnoDrawer/types/recibos.types';

/* ─────────────────────────────────────────
  Session cache helpers (turbo)
───────────────────────────────────────── */
function readReciboFromSession(reciboId: number): ReciboDTO | null {
  try {
    const raw = sessionStorage.getItem(`recibo:${reciboId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ReciboDTO;
  } catch {
    return null;
  }
}

function safeText(v?: string | null, fallback = '—') {
  const t = (v ?? '').toString().trim();
  return t ? t : fallback;
}

function mapReciboToReceipt(dto: ReciboDTO): ReceiptPrint {
  return {
    folio: dto.folio,
    fechaPago: dto.fechaPago,
    concepto: dto.concepto,
    monto: dto.monto ?? 0,
    moneda: dto.moneda ?? 'MXN',
    status: dto.cancelado ? 'CANCELLED' : 'VALID',
    cancelReason: undefined,
    alumnoNombre: dto.alumnoNombre,
    matricula: dto.matricula ?? dto.alumnoId,
    carreraNombre: dto.carreraNombre ?? '—',
    qrPayload: (dto.qrPayload ?? '').trim() || undefined,
  };
}

function mapPagoToReceipt(p: PagoRealDTO, resumen: AlumnoPagosResumenDTO): ReceiptPrint {
  const qr = (p.qrPayload ?? '').trim() || (p.qrPayLoad ?? '').trim() || undefined;

  return {
    folio: safeText(p.folio, '—'),
    fechaPago: safeText(p.fechaPago, '—'),
    concepto: safeText(p.concepto, 'Colegiatura'),
    monto: Number.isFinite(p.monto) ? p.monto : 0,
    moneda: safeText(p.moneda, 'MXN'),
    status: p.cancelado ? 'CANCELLED' : 'VALID',
    cancelReason: undefined,
    alumnoNombre: safeText(resumen.alumnoNombre, '—'),
    matricula: safeText(resumen.alumnoId, '—'),
    carreraNombre: safeText(resumen.carreraNombre, '—'),
    qrPayload: qr,
  };
}

export function useReceiptPrint(args: { reciboId: number | null; alumnoId: string | null }) {
  const { reciboId, alumnoId } = args;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [receipt, setReceipt] = useState<ReceiptPrint | null>(null);

  // QR por URL del backend (mantenemos compatibilidad)
  const qrSrc = useMemo(() => {
    if (!reciboId) return '';
    return RecibosService.qrUrl(reciboId);
  }, [reciboId]);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setError('');
      setReceipt(null);

      if (!reciboId) {
        setLoading(false);
        setError('Falta reciboId en la URL.');
        return;
      }

      // 1) Turbo: sessionStorage
      const cached = readReciboFromSession(reciboId);
      if (cached) {
        if (!alive) return;
        setReceipt(mapReciboToReceipt(cached));
        setLoading(false);
        return;
      }

      // 2) Fallback: API pagos-resumen
      if (!alumnoId) {
        setLoading(false);
        setError('Falta alumnoId. Vuelve al Histórico de pagos y reintenta imprimir.');
        return;
      }

      try {
        const resumen = await AlumnosPagosService.getResumen(alumnoId);
        const pago = resumen.pagosReales.find((x) => x.reciboId === reciboId);

        if (!pago) {
          setLoading(false);
          setError(`No encontré el recibo #${reciboId} dentro de pagos del alumno.`);
          return;
        }

        if (!alive) return;
        setReceipt(mapPagoToReceipt(pago, resumen));
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setLoading(false);
        setError(e instanceof Error ? e.message : 'No se pudo cargar el recibo desde el servidor.');
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [reciboId, alumnoId]);

  return { loading, error, receipt, qrSrc };
}