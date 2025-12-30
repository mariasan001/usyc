import { Suspense } from 'react';
import ReceiptPrintClient from './ReceiptPrintClient';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando recibo…</div>}>
      <ReceiptPrintClient />
    </Suspense>
  );
}
