'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isDashboardOrAdmin = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  return (
    <>
      {!isDashboardOrAdmin && <Header />}
      <main>{children}</main>
      {!isDashboardOrAdmin && <Footer />}
    </>
  );
}
