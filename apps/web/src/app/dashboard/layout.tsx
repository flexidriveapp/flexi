'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, MessageSquare, User, CreditCard, Bell, Shield, LayoutDashboard, LogOut } from 'lucide-react';
import { getUser, clearUser } from '@/lib/store';

const NAV = [
  { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { href: '/dashboard/trips', icon: <Car size={18} />, label: 'My Trips' },
  { href: '/dashboard/messages', icon: <MessageSquare size={18} />, label: 'Messages' },
  { href: '/dashboard/profile', icon: <User size={18} />, label: 'Profile' },
  { href: '/dashboard/kyc', icon: <Shield size={18} />, label: 'KYC Verification' },
  { href: '/dashboard/payments', icon: <CreditCard size={18} />, label: 'Payments' },
  { href: '/dashboard/notifications', icon: <Bell size={18} />, label: 'Notifications' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState('User Name');
  const [userInitial, setUserInitial] = useState('U');

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserName(user.name || 'User');
      setUserInitial((user.name || 'U')[0].toUpperCase());
    }
  }, []);

  const handleSignOut = () => {
    clearUser();
    localStorage.removeItem('flexi_kyc');
    window.location.href = '/';
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border-light)', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{userInitial}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{userName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Guest Account</div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-item${pathname === item.href ? ' active' : ''}`}>
              {item.icon} {item.label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0' }} />
          <button onClick={handleSignOut} className="sidebar-item" style={{ color: 'var(--accent)' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </nav>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
