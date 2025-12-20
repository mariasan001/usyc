'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import s from './AlumnoDrawer.module.css';
import type { Alumno } from '../../types/alumno.types';

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
import type { ProjectionRow } from './types/alumno-drawer.types';

import { RecibosService } from '../../services/recibos.service';
import type { ReciboDTO } from './types/recibos.types';

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

  const [payOpen, setPayOpen] = useState(false);
  const [payRow, setPayRow] = useState<ProjectionRow | null>(null);
  const [paySaving, setPaySaving] = useState(false);

  /**
   * ✅ Guarda el ReciboDTO COMPLETO para que /recibos/print
   * pinte datos reales SIN depender de GET /api/recibos/{id}.
   */
  function cacheReciboForPrint(dto: ReciboDTO) {
    try {
      sessionStorage.setItem(`recibo:${dto.reciboId}`, JSON.stringify(dto));
    } catch {}
  }

  /**
   * ✅ Si vienes desde proyección (solo traes reciboId),
   * intentamos reconstruirlo desde pagosReales y cachearlo.
   */
  function cacheFromPagosReales(reciboId: number) {
    try {
      const p = d.pagosReales.find((x) => x.reciboId === reciboId);
      if (!p) return;

      const dto: ReciboDTO = {
        reciboId: p.reciboId,
        folio: p.folio,
        fechaEmision: p.fechaPago, // fallback
        fechaPago: p.fechaPago,
        alumnoId: d.alumnoId,
        alumnoNombre: d.nombreCompleto, // ✅ aquí va el nombre
        concepto: p.concepto,
        monto: p.monto,
        moneda: p.moneda ?? 'MXN',
        estatusCodigo: p.cancelado ? 'CANCELADO' : 'PAGADO',
        estatusNombre: p.cancelado ? 'Cancelado' : 'Pagado',
        cancelado: !!p.cancelado,
        qrPayload: undefined,
      };

      cacheReciboForPrint(dto);
    } catch {}
  }

  function openPrint(reciboId: number) {
    router.push(`/recibos/print?reciboId=${reciboId}`);
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
      {d.error ? <div className={s.errorBox}>{String(d.error)}</div> : null}

      {d.tab === 'RESUMEN' ? (
        <ResumenPanel
          totals={d.totals}
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
          onReceipt={(reciboId) => {
            // ✅ MUY IMPORTANTE: cachear antes de navegar
            cacheFromPagosReales(reciboId);
            openPrint(reciboId);
          }}
        />
      ) : null}

      {d.tab === 'PAGOS' ? <PagosPanel pagos={d.pagosReales} /> : null}

      {d.tab === 'EXTRAS' ? (
        <ExtrasPanel
          extraConcept=""
          setExtraConcept={() => {}}
          extraAmount=""
          setExtraAmount={() => {}}
          extraDate=""
          setExtraDate={() => {}}
          extraMethod="EFECTIVO"
          setExtraMethod={() => {}}
          onAddExtra={() => alert('(Mock) Extra guardado')}
        />
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

            // ✅ guarda el DTO real del POST (aquí SI viene alumnoNombre/folio/etc.)
            cacheReciboForPrint(created);

            await d.reload();

            setPayOpen(false);
            setPayRow(null);
            d.setTab('PAGOS');

            // si quieres imprimir al pagar:
            // openPrint(created.reciboId);
          } finally {
            setPaySaving(false);
          }
        }}
        saving={paySaving}
      />
    </div>
  );
}
