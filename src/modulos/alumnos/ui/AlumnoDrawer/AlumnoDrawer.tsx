// src/modulos/alumnos/ui/AlumnoDrawer/AlumnoDrawer.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import s from './AlumnoDrawer.module.css';

import type { Alumno } from '../../types/alumno.types';
import type { ProjectionRow } from './types/alumno-drawer.types';
import type { ReciboDTO } from './types/recibos.types';

import DrawerHeader from './parts/DrawerHeader/DrawerHeader';
import IdentityPill from './parts/IdentityPill/IdentityPill';
import StickySummary from './parts/StickySummary/StickySummary';
import DrawerTabs from './parts/DrawerTabs/DrawerTabs';

import ResumenPanel from './parts/panels/ResumenPanel';
import ProyeccionPanel from './parts/ProyeccionPanel/ProyeccionPanel';
import PagosPanel from './parts/PagosPanel/PagosPanel';
import ExtrasPanel from './parts/ExtrasPanel/ExtrasPanel';

import PayModal from './parts/PayModal/PayModal';

import { useAlumnoDrawerData } from './hooks/useAlumnoDrawerData';
import { RecibosService } from '../../services/recibos.service';
import type { ReciboCreateDTO } from './types/recibos.types';

function todayISO() {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toMoneyNumber(v: string) {
  const cleaned = String(v ?? '').replace(/,/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function safeMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Error desconocido';
  }
}

export default function AlumnoDrawer({
  open,
  alumno,
  onClose,
}: {
  open: boolean;
  alumno: Alumno | null;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className={s.backdrop} onMouseDown={onClose} role="presentation">
      <aside
        className={s.drawer}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <DrawerHeader onClose={onClose} />

        {!alumno ? (
          <div className={s.empty}>Sin selección.</div>
        ) : (
          <AlumnoDrawerInner key={alumno.alumnoId} alumno={alumno} />
        )}
      </aside>
    </div>
  );
}

function AlumnoDrawerInner({ alumno }: { alumno: Alumno }) {
  const d = useAlumnoDrawerData({ alumno });
  const router = useRouter();

  // =========================
  // MODAL PAGO (PROYECCIÓN)
  // =========================
  const [payOpen, setPayOpen] = useState(false);
  const [payRow, setPayRow] = useState<ProjectionRow | null>(null);
  const [paySaving, setPaySaving] = useState(false);

  // =========================
  // EXTRAS (FORM + SUBMIT)
  // =========================
  const [extraConcept, setExtraConcept] = useState('');
  const [extraAmount, setExtraAmount] = useState('');
  const [extraDate, setExtraDate] = useState(todayISO());
  const [extraTipoPagoId, setExtraTipoPagoId] = useState(0);
  const [extraSaving, setExtraSaving] = useState(false);
  const [extraError, setExtraError] = useState<string | null>(null);

  // =========================
  // CACHE PARA PRINT (RECIBOS)
  // =========================
  function cacheReciboForPrint(dto: ReciboDTO) {
    try {
      sessionStorage.setItem(`recibo:${dto.reciboId}`, JSON.stringify(dto));
    } catch {
      // ignore
    }
  }

function cacheFromPagosReales(reciboId: number) {
  try {
    const p = d.pagosReales.find((x) => x.reciboId === reciboId);
    if (!p) return;

    const dto: ReciboDTO = {
      reciboId: p.reciboId,
      folio: p.folio,
      fechaEmision: p.fechaEmision ?? p.fechaPago,
      fechaPago: p.fechaPago,
      alumnoId: d.alumnoId,
      alumnoNombre: d.nombreCompleto,
      concepto: p.concepto,
      monto: p.monto,
      moneda: p.moneda ?? 'MXN',
      estatusCodigo: p.cancelado ? 'CANCELADO' : 'PAGADO',
      estatusNombre: p.cancelado ? 'Cancelado' : 'Pagado',
      cancelado: !!p.cancelado,

      // ✅ si no lo tienes en pagos reales, se omite
      qrPayload: (p.qrPayload ?? '').trim() || undefined,
    };

    cacheReciboForPrint(dto);
  } catch {}
}


  function openPrint(reciboId: number) {
    router.push(`/recibos/print?reciboId=${reciboId}`);
  }

  function openReceipt(reciboId: number) {
    if (d.loading) return;
    cacheFromPagosReales(reciboId);
    openPrint(reciboId);
  }

  // =========================
  // EXPORT PDF PROYECCIÓN (CACHE + ROUTE)
  // =========================
  function exportProjectionPdf() {
    if (d.loading) return;
    if (!d.alumnoId) return;

    try {
      const payload = {
        alumnoId: d.alumnoId,
        alumnoNombre: d.nombreCompleto,
        matricula: d.matricula,
        generadoISO: new Date().toISOString(),
        rows: d.projection,
        totals: d.totals,
      };

      sessionStorage.setItem(`projection:${d.alumnoId}`, JSON.stringify(payload));
    } catch {
      // ignore
    }

    router.push(`/alumnos/proyeccion/print?alumnoId=${encodeURIComponent(d.alumnoId)}`);
  }

  // =========================
  // CREAR EXTRA
  // =========================
  async function onAddExtra() {
    setExtraError(null);

    const conceptOk = extraConcept.trim().length >= 3;
    const amountNum = toMoneyNumber(extraAmount);
    const amountOk = Number.isFinite(amountNum) && amountNum > 0;
    const dateOk = !!extraDate;
    const tipoOk = extraTipoPagoId > 0;

    if (!conceptOk) return setExtraError('Escribe un concepto más claro (mín. 3 letras).');
    if (!amountOk) return setExtraError('Ingresa un monto mayor a 0.');
    if (!dateOk) return setExtraError('Selecciona la fecha del pago.');
    if (!tipoOk) return setExtraError('Selecciona un tipo de pago.');
    if (!d.alumnoId) return setExtraError('No hay alumno seleccionado.');

    setExtraSaving(true);

    try {
      // OJO: aquí es donde “se guarda como OTRO”
      // porque lo mandas fijo. Si quieres que guarde el concepto real,
      // cambiamos esto a un conceptoId o conceptoCodigo del catálogo.
      const payload: ReciboCreateDTO = {
        alumnoId: d.alumnoId,
        concepto: 'OTRO',
        montoManual: amountNum,
        fechaPago: extraDate,
        tipoPagoId: extraTipoPagoId,
        comentario: extraConcept.trim(),
      };

      const created = await RecibosService.create(payload);

      cacheReciboForPrint(created);
      await d.reload();

      setExtraConcept('');
      setExtraAmount('');
      setExtraDate(todayISO());
      setExtraError(null);

      d.setTab('PAGOS');
    } catch (err) {
      setExtraError(safeMessage(err) || 'No se pudo registrar el pago extra.');
    } finally {
      setExtraSaving(false);
    }
  }

  return (
    <div className={s.content}>
      <IdentityPill
        nombreCompleto={d.nombreCompleto}
        matricula={d.matricula}
        activo={d.activo}
      />

      <StickySummary totals={d.totals} />
      <DrawerTabs tab={d.tab} onChange={d.setTab} />

      {d.loading ? <div className={s.mutedBox}>Cargando…</div> : null}
      {d.error ? <div className={s.errorBox}>{safeMessage(d.error)}</div> : null}

      {d.tab === 'RESUMEN' ? (
        <ResumenPanel
          ingresoISO={d.ingresoISO}
          terminoISO={d.terminoISO}
          precioMensual={d.precioMensual}
          montoInscripcion={d.montoInscripcion}
          escNombre={d.escNombre}
          carNombre={d.carNombre}
          plaNombre={d.plaNombre}
          matricula={d.matricula}
        />
      ) : null}

      {d.tab === 'PROYECCION' ? (
        <ProyeccionPanel
          rows={d.projection}
          onPay={(row) => {
            setPayRow(row);
            setPayOpen(true);
          }}
          onReceipt={(reciboId) => openReceipt(reciboId)}
          onExportPdf={exportProjectionPdf}
        />
      ) : null}

      {d.tab === 'PAGOS' ? (
        <PagosPanel pagos={d.pagosReales} />
      ) : null}

      {d.tab === 'EXTRAS' ? (
        <>
          {extraError ? <div className={s.errorBox}>{extraError}</div> : null}

          <ExtrasPanel
            extraConcept={extraConcept}
            setExtraConcept={setExtraConcept}
            extraAmount={extraAmount}
            setExtraAmount={setExtraAmount}
            extraDate={extraDate}
            setExtraDate={setExtraDate}
            extraTipoPagoId={extraTipoPagoId}
            setExtraTipoPagoId={setExtraTipoPagoId}
            onAddExtra={onAddExtra}
            submitting={extraSaving}
          />
        </>
      ) : null}

      <PayModal
        open={payOpen}
        row={payRow}
        alumnoId={d.alumnoId}
        onClose={() => {
          if (paySaving) return;
          setPayOpen(false);
          setPayRow(null);
        }}
        onSubmit={async (payload) => {
          setPaySaving(true);
          try {
            const created = await RecibosService.create(payload);
            cacheReciboForPrint(created);
            await d.reload();

            setPayOpen(false);
            setPayRow(null);
            d.setTab('PAGOS');
          } finally {
            setPaySaving(false);
          }
        }}
      />
    </div>
  );
}
