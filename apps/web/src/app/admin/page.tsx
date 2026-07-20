'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Car, Calendar, Shield, IndianRupee, TrendingUp, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  pendingKyc: number;
  pendingVehicles: number;
  activeListings: number;
  totalGMV: number;
  platformRevenue: number;
  recentBookings: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, totalBookings: 0, pendingKyc: 0, pendingVehicles: 0,
    activeListings: 0, totalGMV: 0, platformRevenue: 0, recentBookings: []
  });

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();

      const [usersRes, bookingsRes, kycRes, vehiclesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('*, vehicles(make, model)').order('created_at', { ascending: false }),
        supabase.from('kyc_records').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('vehicles').select('id, status'),
      ]);

      const bookings = bookingsRes.data || [];
      const vehicles = vehiclesRes.data || [];

      const totalGMV = bookings.reduce((sum: number, b: any) => {
        const pricing = b.pricing || {};
        return sum + (b.status !== 'cancelled' ? (pricing.total || 0) : 0);
      }, 0);

      const platformRevenue = bookings.reduce((sum: number, b: any) => {
        const pricing = b.pricing || {};
        return sum + (b.status !== 'cancelled' ? (pricing.platformFee || 0) : 0);
      }, 0);

      setStats({
        totalUsers: usersRes.count || 0,
        totalBookings: bookings.length,
        pendingKyc: kycRes.count || 0,
        pendingVehicles: vehicles.filter(v => v.status === 'pending').length,
        activeListings: vehicles.filter(v => v.status === 'active').length,
        totalGMV,
        platformRevenue,
        recentBookings: bookings.slice(0, 5).map((b: any) => ({
          id: b.id,
          confirmationCode: b.confirmation_code || b.id.slice(0, 8),
          carName: b.vehicles ? `${b.vehicles.make} ${b.vehicles.model}` : 'N/A',
          total: b.pricing?.total || 0,
          status: b.status,
          createdAt: b.created_at,
        })),
      });
    }

    loadStats();
  }, []);

  const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
    pending: { color: '#d97706', bg: '#fffbeb' }, confirmed: { color: 'var(--primary)', bg: '#eff6ff' },
    active: { color: '#16a34a', bg: '#f0fdf4' }, completed: { color: '#64748b', bg: '#f8fafc' },
    cancelled: { color: 'var(--accent)', bg: '#fff1f2' }, upcoming: { color: '#0ea5e9', bg: '#f0f9ff' },
  };

  const STAT_CARDS = [
    { icon: <IndianRupee size={22} />, label: 'Total GMV', value: `₹${stats.totalGMV.toLocaleString('en-IN')}`, bg: '#eff6ff', color: 'var(--primary)' },
    { icon: <Calendar size={22} />, label: 'Total Bookings', value: stats.totalBookings.toString(), bg: '#f0fdf4', color: '#16a34a' },
    { icon: <Users size={22} />, label: 'Registered Users', value: stats.totalUsers.toString(), bg: '#fefce8', color: '#ca8a04' },
    { icon: <Car size={22} />, label: 'Active Listings', value: stats.activeListings.toString(), bg: '#fdf4ff', color: '#9333ea' },
    { icon: <Shield size={22} />, label: 'Pending KYC', value: stats.pendingKyc.toString(), bg: '#fff1f2', color: 'var(--accent)' },
    { icon: <TrendingUp size={22} />, label: 'Platform Revenue', value: `₹${stats.platformRevenue.toLocaleString('en-IN')}`, bg: '#ecfdf5', color: '#059669' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Platform overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {(stats.pendingKyc > 0 || stats.pendingVehicles > 0) && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#d97706" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>
              {stats.pendingKyc > 0 && `${stats.pendingKyc} KYC submissions`}
              {stats.pendingKyc > 0 && stats.pendingVehicles > 0 && ' and '}
              {stats.pendingVehicles > 0 && `${stats.pendingVehicles} vehicles`} pending review
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {stats.pendingKyc > 0 && <Link href="/admin/kyc" className="btn btn-sm" style={{ background: '#d97706', color: 'white' }}>Review KYC</Link>}
            {stats.pendingVehicles > 0 && <Link href="/admin/vehicles" className="btn btn-sm btn-outline" style={{ fontSize: 13, borderColor: '#d97706', color: '#d97706' }}>Review Vehicles</Link>}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
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
              {stats.recentBookings.map((b: any) => {
                const st = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600, color: 'var(--primary)', fontSize: 13 }}>{b.confirmationCode}</td>
                    <td style={{ padding: '12px 8px 12px 0', color: 'var(--text-secondary)' }}>{b.carName}</td>
                    <td style={{ padding: '12px 8px 12px 0', fontWeight: 700 }}>₹{b.total.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{ background: st.bg, color: st.color, padding: '3px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{b.status}</span>
                    </td>
                    <td style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>
                      {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                );
              })}
              {stats.recentBookings.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { href: '/admin/kyc', label: 'Review KYC Queue', count: stats.pendingKyc, color: '#d97706', bg: '#fffbeb' },
              { href: '/admin/vehicles', label: 'Approve Vehicles', count: stats.pendingVehicles, color: '#0ea5e9', bg: '#f0f9ff' },
              { href: '/admin/users', label: 'Manage Users', count: stats.totalUsers, color: '#16a34a', bg: '#f0fdf4' },
              { href: '/admin/bookings', label: 'All Bookings', count: stats.totalBookings, color: 'var(--primary)', bg: '#eff6ff' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: a.bg, textDecoration: 'none', color: a.color, fontWeight: 600, fontSize: 14, transition: 'all 0.15s' }}>
                {a.label}
                <span style={{ background: a.color, color: 'white', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>{a.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
