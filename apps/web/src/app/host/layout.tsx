'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Car, Calendar, IndianRupee, BarChart2, MessageSquare, Settings, LogOut, Star, Plus, ShieldCheck } from 'lucide-react';

const NAV = [
  { href: '/host', icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { href: '/host/vehicles', icon: <Car size={18} />, label: 'My Vehicles' },
  { href: '/host/bookings', icon: <Calendar size={18} />, label: 'Bookings' },
  { href: '/host/earnings', icon: <IndianRupee size={18} />, label: 'Earnings' },
  { href: '/host/performance', icon: <BarChart2 size={18} />, label: 'Performance' },
  { href: '/host/messages', icon: <MessageSquare size={18} />, label: 'Messages' },
  { href: '/host/kyc', icon: <ShieldCheck size={18} />, label: 'Verification' },
  { href: '/host/settings', icon: <Settings size={18} />, label: 'Settings' },
];

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('flexi_user');
    if (!userStr) {
      router.push('/login');
    } else {
      const user = JSON.parse(userStr);
      if (user.role !== 'host') {
        // Technically they should be a host, but for demo we just ensure they are logged in
      }
      setIsAuthenticated(true);
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)', marginBottom: 8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #f5a623, #e94560)', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
            <Star size={11} fill="white" /> Host Dashboard
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>H</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Host Name</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>All-Star Host</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 12px 12px' }}>
          <Link href="/host/vehicles/new" className="btn btn-primary btn-sm btn-full" style={{ marginBottom: 4 }}>
            <Plus size={14} /> Add New Car
          </Link>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-item${pathname === item.href ? ' active' : ''}`}>
              {item.icon} {item.label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0' }} />
          <Link href="/dashboard" className="sidebar-item"><LayoutDashboard size={18} /> Guest Dashboard</Link>
          <button className="sidebar-item" style={{ color: 'var(--accent)' }} onClick={() => { localStorage.clear(); window.location.href = '/'; }}>
            <LogOut size={18} /> Sign Out
          </button>
        </nav>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
