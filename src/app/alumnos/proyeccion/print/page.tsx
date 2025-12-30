import { Suspense } from 'react';
import ProyeccionPrintClient from './ProyeccionPrintClient';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando reporte…</div>}>
      <ProyeccionPrintClient />
    </Suspense>
  );
}
