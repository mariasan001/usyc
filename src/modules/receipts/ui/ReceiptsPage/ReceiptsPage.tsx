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
        title="Nuevo recibo"
        subtitle="Captura alumno, concepto, monto y fecha"
        right={<Badge tone="info">Emisión</Badge>}
        className={s.left}
      >
        <ReceiptForm onCreate={vm.createReceipt} creating={vm.creating} />
      </Card>

      <Card
        title="Recibos"
        subtitle="Consulta, filtra y cancela con motivo"
        right={<Badge tone="info">Historial</Badge>}
        className={s.right}
      >
        <ReceiptsTable
          items={vm.items}
          loading={vm.loading}
          error={vm.error}
          query={vm.query}
          setQuery={vm.setQuery}
          onRefresh={vm.refresh}
          onCancel={vm.cancelReceipt}
        />
      </Card>
    </div>
  );
}
