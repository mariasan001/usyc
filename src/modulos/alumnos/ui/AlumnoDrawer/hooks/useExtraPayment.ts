'use client';

import { useCallback, useState } from 'react';
import type { ReciboCreateDTO } from '../types/recibos.types';
import { useAlumnoCreateRecibo } from './useAlumnoCreateRecibo'; // o el que uses para POST /api/recibos

function normalizeMoneyInput(v: string) {
  const cleaned = v.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join('')}`;
}

function toMoney(v: string) {
  const n = Number(String(v ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : NaN;
}

export function useExtraPayment(alumnoId: string) {
  const api = useAlumnoCreateRecibo(); // tu hook/servicio de crear recibo

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [ok, setOk] = useState<string>('');

  const submit = useCallback(
    async (input: { concept: string; amount: string; dateISO: string; tipoPagoId: number }) => {
      setError('');
      setOk('');

      const concept = input.concept.trim();
      const amountClean = normalizeMoneyInput(input.amount);
      const amount = toMoney(amountClean);

      if (!alumnoId) return setError('Falta alumnoId.');
      if (concept.length < 3) return setError('Concepto demasiado corto.');
      if (!Number.isFinite(amount) || amount <= 0) return setError('Monto inválido.');
      if (!input.dateISO) return setError('Falta fecha.');
      if (!input.tipoPagoId || input.tipoPagoId <= 0) return setError('Selecciona tipo de pago.');

      const payload: ReciboCreateDTO = {
        alumnoId,
        concepto: 'OTRO',              // ✅ manual
        montoManual: amount,           // ✅ obligatorio
        fechaPago: input.dateISO,
        tipoPagoId: input.tipoPagoId,
        comentario: concept,           // ✅ aquí se guarda el concepto real “humano”
      };

      setSubmitting(true);
      try {
        const recibo = await api.create(payload);

        // Importantísimo para tu flujo de print:
        if (recibo?.reciboId) {
          sessionStorage.setItem(`recibo:${recibo.reciboId}`, JSON.stringify(recibo));
        }

        setOk(recibo?.folio ? `Extra registrado: ${recibo.folio}` : 'Pago extra registrado ✅');
        return recibo;
      } catch (e: any) {
        setError(e?.message ?? 'No se pudo registrar el pago extra.');
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [alumnoId, api],
  );

  return { submit, submitting, error, ok };
}
