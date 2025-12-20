// src/app/verificar/page.tsx
'use client';

import AppShell from '@/layout/AppShell/AppShell';
import VerifyQrPage from '@/qr/ui/VerifyQrPage/VerifyQrPage';

export default function VerifyPage() {
  return (
    <AppShell>
      <VerifyQrPage />
    </AppShell>
  );
}
