'use client';
import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Calendar, CreditCard, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function HostEarningsPage() {
  const [metrics, setMetrics] = useState({ lifetime: 0, monthly: 0, weekly: 0 });
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const userStr = localStorage.getItem('flexi_user');
      const hostId = userStr ? JSON.parse(userStr).id : '22222222-2222-2222-2222-222222222222';

      const { data } = await supabase.from('bookings').select('*, vehicles!inner(*)').eq('vehicles.host_id', hostId).eq('status', 'completed');
      
      if (data) {
        const formatted = data.map(b => ({
          ...b,
          car: { model: b.vehicles?.model || 'Unknown' },
          earnings: Math.floor(b.pricing?.tripCost ? b.pricing.tripCost * 0.9 : 0),
          endDate: b.end_date
        }));
        
        const sorted = formatted.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
        setTrips(sorted);
        
        const lifetime = sorted.reduce((sum, t) => sum + t.earnings, 0);
        const monthly = sorted.filter(t => new Date(t.endDate).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.earnings, 0);
        const weekly = sorted.filter(t => new Date(t.endDate).getTime() > Date.now() - 86400000 * 7).reduce((sum, t) => sum + t.earnings, 0);
        
        setMetrics({ lifetime, monthly, weekly });
      }
    }
    loadData();
  }, []);

  const MONTHLY_DATA = [
    { month: 'Jan', earnings: 18500 },
    { month: 'Feb', earnings: 22000 },
    { month: 'Mar', earnings: 19800 },
    { month: 'Apr', earnings: 26500 },
    { month: 'May', earnings: 31200 },
    { month: 'Jun', earnings: metrics.monthly },
  ];
  
  const maxEarnings = Math.max(...MONTHLY_DATA.map(d => d.earnings));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Earnings Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your income and payout history</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, var(--primary), #7c3aed)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: 0.9 }}>
            <IndianRupee size={20} /> <span style={{ fontWeight: 600, fontSize: 14 }}>Lifetime Earnings</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>₹{metrics.lifetime.toLocaleString('en-IN')}</div>
          <div style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>Across all your vehicles</div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-secondary)' }}>
            <Calendar size={20} /> <span style={{ fontWeight: 600, fontSize: 14 }}>This Month (Jun)</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-dark)' }}>₹{metrics.monthly.toLocaleString('en-IN')}</div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <TrendingUp size={14} /> +12% from last month
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-secondary)' }}>
            <CreditCard size={20} /> <span style={{ fontWeight: 600, fontSize: 14 }}>Next Payout (Weekly)</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-dark)' }}>₹{metrics.weekly.toLocaleString('en-IN')}</div>
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>Processing on Friday</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 24 }}>Earnings (Last 6 Months)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 240, marginTop: 40, paddingBottom: 20, borderBottom: '1px solid var(--border-light)' }}>
            {MONTHLY_DATA.map(d => (
              <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -30, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  ₹{(d.earnings / 1000).toFixed(1)}k
                </div>
                <div style={{ width: '100%', maxWidth: 60, background: 'linear-gradient(to top, #e0e7ff, #a5b4fc)', borderRadius: '8px 8px 0 0', height: `${(d.earnings / maxEarnings) * 200}px`, transition: 'all 0.3s', cursor: 'pointer', minHeight: 12 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(to top, var(--primary), #818cf8)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(to top, #e0e7ff, #a5b4fc)'; }} 
                />
                <div style={{ fontSize: 13, color: 'var(--text-dark)', fontWeight: 600 }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Recent Transactions</h3>
            <div style={{ color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
              Filter <ChevronDown size={14} />
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            {trips.map(trip => (
              <div key={trip.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Trip: {trip.car.model}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(trip.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#16a34a', fontSize: 15 }}>+₹{trip.earnings.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Completed</div>
                </div>
              </div>
            ))}
            {trips.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 40 }}>
                No recent transactions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
