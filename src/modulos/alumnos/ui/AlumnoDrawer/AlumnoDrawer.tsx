'use client';

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

import { useAlumnoDrawerData } from './hooks/useAlumnoDrawerData';

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

  // ✅ key: cuando cambia alumno, React “remonta” el inner => reset automático
  const innerKey = alumno?.alumnoId ?? 'no-alumno';

  return (
    <div className={s.backdrop} onMouseDown={onClose} role="presentation">
      <aside
        className={s.drawer}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <AlumnoDrawerInner key={innerKey} alumno={alumno} onClose={onClose} />
      </aside>
    </div>
  );
}

function AlumnoDrawerInner({
  alumno,
  onClose,
}: {
  alumno: Alumno | null;
  onClose: () => void;
}) {
  // ✅ el hook ya NO recibe `open` y ya NO hace reset con useEffect
  const d = useAlumnoDrawerData({ alumno });

  return (
    <>
      <DrawerHeader onClose={onClose} />

      {!alumno ? (
        <div className={s.empty}>Sin selección.</div>
      ) : (
        <div className={s.content}>
          <IdentityPill
            nombreCompleto={d.nombreCompleto}
            matricula={d.matricula}
            activo={d.activo}
          />

          <StickySummary totals={d.totals} />

          <DrawerTabs tab={d.tab} onChange={d.setTab} />

          {d.tab === 'RESUMEN' ? (
            <ResumenPanel
              totals={d.totals}
              ingresoISO={d.ingresoISO}
              terminoISO={d.terminoISO}
              duracionMeses={d.duracionMeses}
              precioMensual={d.precioMensual}
              escNombre={d.escNombre}
              carNombre={d.carNombre}
              plaNombre={d.plaNombre}
              matricula={d.matricula}
            />
          ) : null}

          {d.tab === 'PROYECCION' ? (
            <ProyeccionPanel
              projection={d.projection}
              onPay={(dueDate) => {
                d.setTab('PAGOS');
                d.setPayDate(dueDate);
              }}
              onReceipt={(paymentId) => d.printReceipt(paymentId)}
            />
          ) : null}

          {d.tab === 'PAGOS' ? (
            <PagosPanel
              precioMensual={d.precioMensual}
              payDate={d.payDate}
              setPayDate={d.setPayDate}
              payMethod={d.payMethod}
              setPayMethod={d.setPayMethod}
              alumnoPayments={d.alumnoPayments}
              onAddMensualidad={d.addMensualidadPayment}
              onToggle={d.togglePaymentStatus}
              onRemove={d.removePayment}
              onPrint={d.printReceipt}
            />
          ) : null}

          {d.tab === 'EXTRAS' ? (
            <ExtrasPanel
              extraConcept={d.extraConcept}
              setExtraConcept={d.setExtraConcept}
              extraAmount={d.extraAmount}
              setExtraAmount={d.setExtraAmount}
              extraDate={d.extraDate}
              setExtraDate={d.setExtraDate}
              extraMethod={d.extraMethod}
              setExtraMethod={d.setExtraMethod}
              onAddExtra={d.addExtraPayment}
            />
          ) : null}
        </div>
      )}
    </>
  );
}
