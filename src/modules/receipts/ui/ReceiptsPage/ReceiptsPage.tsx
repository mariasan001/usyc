'use client';

import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';

import ReceiptForm from '../ReceiptForm/ReceiptForm';
import ReceiptsTable from '../ReceiptsTable/ReceiptsTable';
import { useReceipts } from '../../hooks/useReceipts';

import s from './ReceiptsPage.module.css';

export default function ReceiptsPage() {
  const vm = useReceipts();

  return (
    <div className={s.grid}>
      <Card
        title="Registrar alumno y pago"
        subtitle="Captura datos del alumno "
        right={<Badge tone="info">Registro</Badge>}
        className={s.left}
      >
        <ReceiptForm onCreate={vm.createReceipt} creating={vm.creating} />
      </Card>

      <Card
        title="Alumnos"
        subtitle="Directorio general • ver historial y proyección por alumno"
        right={<Badge tone="info">Directorio</Badge>}
        className={s.right}
      >
        <ReceiptsTable
          items={vm.items}
          loading={vm.loading}
          error={vm.error}
          query={vm.query}
          setQuery={vm.setQuery}
          onRefresh={vm.refresh}
          // ✅ ya no se cancela aquí (eso va dentro del modal de alumno / historial)
        />
      </Card>
    </div>
  );
}
