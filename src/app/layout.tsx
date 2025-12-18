import '@/shared/styles/globals.css';

export const metadata = { title: 'Control de Recibos • USYC' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
