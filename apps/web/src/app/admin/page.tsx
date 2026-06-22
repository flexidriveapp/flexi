'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Car, Calendar, Shield, IndianRupee, TrendingUp, AlertCircle } from 'lucide-react';
import { getAllBookings, getAllUsers, getPendingKYC, getAllVehicles, type AdminUser, type AdminVehicle } from '@/lib/adminStore';
import { type Booking } from '@/lib/store';

const MONTHLY_DATA = [
  { month: 'Jan', revenue: 18500 }, { month: 'Feb', revenue: 22000 },
  { month: 'Mar', revenue: 19800 }, { month: 'Apr', revenue: 26500 },
  { month: 'May', revenue: 31200 }, { month: 'Jun', revenue: 27800 },
];

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  pending: { color: '#d97706', bg: '#fffbeb' }, confirmed: { color: 'var(--primary)', bg: '#eff6ff' },
  active: { color: '#16a34a', bg: '#f0fdf4' }, completed: { color: '#64748b', bg: '#f8fafc' },
  cancelled: { color: 'var(--accent)', bg: '#fff1f2' },
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingKyc, setPendingKyc] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);

  useEffect(() => {
    setUsers(getAllUsers());
    setBookings(getAllBookings());
    setPendingKyc(getPendingKYC());
    setVehicles(getAllVehicles());
  }, []);

  const pendingVehiclesCount = vehicles.filter(v => v.status === 'pending').length;
  const activeListings = vehicles.filter(v => v.status === 'approved').length + 890; // Add 890 mock to look realistic

  const totalGMV = bookings.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.pricing.total : 0), 0);
  const platformRevenue = bookings.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.pricing.platformFee : 0), 0);

  const STATS = [
    { icon: <IndianRupee size={22} />, label: 'Total GMV', value: `₹${totalGMV.toLocaleString('en-IN')}`, change: '+18%', up: true, bg: '#eff6ff', color: 'var(--primary)' },
    { icon: <Calendar size={22} />, label: 'Total Bookings', value: bookings.length.toString(), change: '+24%', up: true, bg: '#f0fdf4', color: '#16a34a' },
    { icon: <Users size={22} />, label: 'Registered Users', value: users.length.toString(), change: '+9%', up: true, bg: '#fefce8', color: '#ca8a04' },
    { icon: <Car size={22} />, label: 'Active Listings', value: activeListings.toString(), change: '+5%', up: true, bg: '#fdf4ff', color: '#9333ea' },
    { icon: <Shield size={22} />, label: 'Pending KYC', value: pendingKyc.length.toString(), change: 'needs review', up: false, bg: '#fff1f2', color: 'var(--accent)' },
    { icon: <TrendingUp size={22} />, label: 'Platform Revenue', value: `₹${platformRevenue.toLocaleString('en-IN')}`, change: '+18%', up: true, bg: '#ecfdf5', color: '#059669' },
  ];

  const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Platform overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {(pendingKyc.length > 0 || pendingVehiclesCount > 0) && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#d97706" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>
              {pendingKyc.length > 0 && `${pendingKyc.length} KYC submissions`} 
              {pendingKyc.length > 0 && pendingVehiclesCount > 0 && ' and '}
              {pendingVehiclesCount > 0 && `${pendingVehiclesCount} vehicles`} pending review
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {pendingKyc.length > 0 && <Link href="/admin/kyc" className="btn btn-sm" style={{ background: '#d97706', color: 'white' }}>Review KYC</Link>}
            {pendingVehiclesCount > 0 && <Link href="/admin/vehicles" className="btn btn-sm btn-outline" style={{ fontSize: 13, borderColor: '#d97706', color: '#d97706' }}>Review Vehicles</Link>}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>{s.label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: s.up ? '#16a34a' : 'var(--accent)' }}>
                {s.up ? '↑' : '↓'} {s.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700 }}>Revenue Overview</h3>
            <Link href="/admin/reports" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>Full report</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 160 }}>
            {MONTHLY_DATA.map(d => (
              <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>₹{(d.revenue / 1000).toFixed(0)}k</div>
                <div style={{ width: '100%', background: 'linear-gradient(to top, var(--primary), #7c3aed)', borderRadius: '6px 6px 0 0', height: `${(d.revenue / maxRevenue) * 120}px`, minHeight: 8 }} />
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { href: '/admin/kyc', label: 'Review KYC Queue', count: pendingKyc.length, color: '#d97706', bg: '#fffbeb' },
              { href: '/admin/vehicles', label: 'Approve Vehicles', count: pendingVehiclesCount, color: '#0ea5e9', bg: '#f0f9ff' },
              { href: '/admin/users', label: 'Manage Users', count: users.length, color: '#16a34a', bg: '#f0fdf4' },
              { href: '/admin/bookings', label: 'All Bookings', count: bookings.length, color: 'var(--primary)', bg: '#eff6ff' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: a.bg, textDecoration: 'none', color: a.color, fontWeight: 600, fontSize: 14, transition: 'all 0.15s' }}>
                {a.label}
                <span style={{ background: a.color, color: 'white', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>{a.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700 }}>Recent Bookings</h3>
          <Link href="/admin/bookings" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View all</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['ID', 'Car', 'Amount', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '8px 0', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, 5).map(b => {
              const st = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
              return (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 0', fontWeight: 600, color: 'var(--primary)', fontSize: 13 }}>{b.confirmationCode || b.id}</td>
                  <td style={{ padding: '12px 8px 12px 0', color: 'var(--text-secondary)' }}>{b.car.make} {b.car.model}</td>
                  <td style={{ padding: '12px 8px 12px 0', fontWeight: 700 }}>₹{b.pricing.total.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 0' }}>
                    <span style={{ background: st.bg, color: st.color, padding: '3px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{b.status}</span>
                  </td>
                  <td style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>
                    {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
