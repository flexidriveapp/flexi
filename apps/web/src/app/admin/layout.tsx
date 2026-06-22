'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Car, Calendar, Shield, IndianRupee, BarChart2, Settings, LogOut, AlertTriangle, MapPin } from 'lucide-react';

const NAV = [
  { href: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/admin/users', icon: <Users size={18} />, label: 'Users' },
  { href: '/admin/vehicles', icon: <Car size={18} />, label: 'Vehicles' },
  { href: '/admin/bookings', icon: <Calendar size={18} />, label: 'Bookings' },
  { href: '/admin/kyc', icon: <Shield size={18} />, label: 'KYC Queue' },
  { href: '/admin/payments', icon: <IndianRupee size={18} />, label: 'Payments' },
  { href: '/admin/reports', icon: <BarChart2 size={18} />, label: 'Reports' },
  { href: '/admin/cities', icon: <MapPin size={18} />, label: 'Cities' },
  { href: '/admin/categories', icon: <Settings size={18} />, label: 'Categories' },
  { href: '/admin/settings', icon: <Settings size={18} />, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuth(true);
      return;
    }
    const userStr = localStorage.getItem('flexi_user');
    if (!userStr) {
      router.push('/admin/login');
    } else {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
          router.push('/admin/login');
        } else {
          setIsAuth(true);
        }
      } catch (e) {
        router.push('/admin/login');
      }
    }
  }, [router, pathname]);

  if (isAuth === null) return null;

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Light sidebar for admin */}
      <aside style={{ width: 260, background: 'white', borderRight: '1px solid var(--border-light)', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dark)', textDecoration: 'none', marginBottom: 20, fontSize: 18, fontWeight: 800 }}>
            <div style={{ width: 32, height: 32, background: 'var(--primary)', color: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🚗</div>
            Flexi
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
            <AlertTriangle size={11} /> Admin Panel
          </div>
        </div>

        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: active ? 'var(--primary)' : 'var(--text-secondary)', background: active ? '#eff6ff' : 'transparent', border: active ? '1px solid #bfdbfe' : '1px solid transparent', textDecoration: 'none', transition: 'all 0.15s' }}>
                {item.icon} {item.label}
              </Link>
            );
          })}
          <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0' }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            onClick={() => { localStorage.removeItem('flexi_user'); localStorage.removeItem('flexi_access_token'); window.location.href = '/admin/login'; }}>
            <LogOut size={18} /> Sign Out
          </button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 32, background: '#f8fafc', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
