import AppShell from '@/layout/AppShell/AppShell';
import ReceiptsPage from '@/modules/receipts/ui/ReceiptsPage/ReceiptsPage';

export default function Page() {
  return (
    <AppShell>
      <ReceiptsPage />
    </AppShell>
  );
}
