import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Distribuidora Paucara | Vouchers Hotspot',
  description: 'Portal cautivo y panel de vouchers para la red de Distribuidora Paucara.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
