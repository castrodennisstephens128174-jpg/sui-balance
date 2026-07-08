import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { Providers } from '@/ui/providers';
import './globals.css';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Sui Tool Template',
    template: '%s · Sui Tool Template',
  },
  description: 'A starter template for small Sui testnet dApps.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
