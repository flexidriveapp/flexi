'use client';
import Link from 'next/link';
import { TrendingUp, ArrowRight, CheckCircle, Clock, Car } from 'lucide-react';

import { createClient } from '@/lib/supabase';
import { useState, useEffect } from 'react';

const PENDING_BOOKINGS: any[] = [];

export default function HostOverviewPage() {
  const [vehicleCount, setVehicleCount] = useState(0);
  const [metrics, setMetrics] = useState({
    monthlyEarnings: 0,
    activeListings: 0,
    pendingRequests: 0,
    monthlyData: [
      { month: 'Jan', earnings: 0 },
      { month: 'Feb', earnings: 0 },
      { month: 'Mar', earnings: 0 },
      { month: 'Apr', earnings: 0 },
      { month: 'May', earnings: 0 },
      { month: 'Jun', earnings: 0 },
    ]
  });

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const userStr = localStorage.getItem('flexi_user');
      const hostId = userStr ? JSON.parse(userStr).id : '22222222-2222-2222-2222-222222222222';
      
      const { count } = await supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('host_id', hostId);
      setVehicleCount(count || 0);

      const { data: bookings } = await supabase.from('bookings').select('*, vehicles!inner(*)').eq('vehicles.host_id', hostId).eq('status', 'completed');
      
      let monthlyTotal = 0;
      if (bookings) {
        monthlyTotal = bookings
          .filter(b => new Date(b.end_date).getMonth() === new Date().getMonth())
          .reduce((sum, b) => sum + Math.floor(b.pricing?.tripCost ? b.pricing.tripCost * 0.9 : 0), 0);
      }

      setMetrics(m => ({
        ...m,
        activeListings: count || 0,
        monthlyEarnings: monthlyTotal
      }));
    }
    loadData();
  }, []);

  const maxEarnings = Math.max(...metrics.monthlyData.map(d => d.earnings), 100);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{vehicleCount}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Host Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your performance at a glance</p>
        </div>
        <Link href="/host/vehicles/new" className="btn btn-primary">+ List New Car</Link>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '💰', label: 'This Month', value: `₹${metrics.monthlyEarnings.toLocaleString('en-IN')}`, change: 'Current month', up: true, bg: '#eff6ff', color: 'var(--primary)' },
          { icon: '🚗', label: 'Active Listings', value: metrics.activeListings.toString(), change: 'Available vehicles', up: true, bg: '#f0fdf4', color: '#16a34a' },
          { icon: '📅', label: 'Pending Requests', value: metrics.pendingRequests.toString(), change: 'Needs your response', up: false, bg: '#fffbeb', color: '#d97706' },
          { icon: '⭐', label: 'Overall Rating', value: 'N/A', change: '0 total reviews', up: true, bg: '#fefce8', color: '#ca8a04' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color, fontSize: 22 }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Earnings Chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Earnings (6 months)</h3>
            <Link href="/host/earnings" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View details</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
            {metrics.monthlyData.map(d => (
              <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  ₹{(d.earnings / 1000).toFixed(0)}k
                </div>
                <div style={{ width: '100%', background: 'linear-gradient(to top, var(--primary), #7c3aed)', borderRadius: '6px 6px 0 0', height: `${(d.earnings / maxEarnings) * 120}px`, transition: 'all 0.3s', cursor: 'pointer', minHeight: 8 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')} />
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.month}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#eff6ff', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Total (6 months)</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>₹{metrics.monthlyData.reduce((s, d) => s + d.earnings, 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Pending Requests</h3>
            <Link href="/host/bookings" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View all</Link>
          </div>
          {PENDING_BOOKINGS.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
              <Clock size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>No pending requests</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PENDING_BOOKINGS.map(b => (
                <div key={b.id} style={{ padding: '16px', border: '1.5px solid var(--border-light)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.guest}</div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>₹{b.amount.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{b.car} · {b.dates}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-sm btn-primary" style={{ flex: 1 }}>✓ Accept</button>
                    <button className="btn btn-sm" style={{ flex: 1, background: '#fff1f2', color: 'var(--accent)', border: '1px solid #fecdd3' }}>✕ Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Performance Summary */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
            <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>This month's performance</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Acceptance Rate', value: '92%', color: '#16a34a' },
                { label: 'Response Time', value: '< 1 hour', color: 'var(--primary)' },
                { label: 'Commitment Rate', value: '98%', color: 'var(--primary)' },
              ].map(p => (
                <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
                  <span style={{ fontWeight: 700, color: p.color }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* My Vehicles Quick View */}
      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>My Vehicles</h3>
          <Link href="/host/vehicles" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            Manage <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { name: 'Hyundai Creta 2023', status: 'active', trips: 47, earnings: 141000, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80' },
            { name: 'Maruti Brezza 2022', status: 'active', trips: 28, earnings: 55000, img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=80' },
            { name: 'Tata Nexon EV 2023', status: 'inactive', trips: 12, earnings: 41000, img: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=400&q=80' },
          ].map(v => (
            <div key={v.name} style={{ border: '1.5px solid var(--border-light)', borderRadius: 12, overflow: 'hidden' }}>
              <img src={v.img} alt={v.name} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
              <div style={{ padding: '14px' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{v.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>{v.trips} trips</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{(v.earnings / 1000).toFixed(0)}k earned</span>
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.status === 'active' ? '#16a34a' : '#94a3b8' }} />
                  <span style={{ fontSize: 12, color: v.status === 'active' ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>{v.status === 'active' ? 'Available' : 'Unavailable'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
