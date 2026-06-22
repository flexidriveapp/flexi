import type { Metadata } from 'next';
import './globals.css';
import ClientLayoutWrapper from '@/components/layout/ClientLayoutWrapper';

export const metadata: Metadata = {
  title: { default: 'Flexi — Self Drive Car Rental', template: '%s | Flexi' },
  description: 'Find and book the perfect self-drive car near you. Flexi connects you with local car owners for an amazing road trip experience.',
  keywords: ['car rental', 'self drive', 'flexi', 'rent a car', 'India', 'self drive car'],
  authors: [{ name: 'Flexi' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://flexi.in',
    siteName: 'Flexi',
    title: 'Flexi — Self Drive Car Rental',
    description: 'Find and book the perfect self-drive car near you.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚗</text></svg>" />
      </head>
      <body>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
