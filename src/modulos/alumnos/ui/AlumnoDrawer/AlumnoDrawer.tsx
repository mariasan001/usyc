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
      {d.error ? (
        <div className={s.errorBox}>{String(d.error)}</div>
      ) : null}

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
            // por ahora solo cambia de tab, cuando exista POST pago ya usas row.periodo
            d.setTab('PAGOS');
          }}
          onReceipt={(reciboId) => {
            alert(`(Mock) Abrir recibo: ${reciboId}`);
          }}
        />
      ) : null}

      {d.tab === 'PAGOS' ? <PagosPanel pagos={d.pagosReales} /> : null}

      {d.tab === 'EXTRAS' ? <ExtrasPanel /> : null}
    </div>
  );
}
