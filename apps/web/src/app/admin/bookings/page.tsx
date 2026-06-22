'use client';
import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#d97706', bg: '#fffbeb' },
  confirmed: { label: 'Confirmed', color: 'var(--primary)', bg: '#eff6ff' },
  upcoming: { label: 'Upcoming', color: 'var(--primary)', bg: '#eff6ff' },
  active: { label: 'Active', color: '#16a34a', bg: '#f0fdf4' },
  started: { label: 'Started', color: '#16a34a', bg: '#f0fdf4' },
  completed: { label: 'Completed', color: '#64748b', bg: '#f8fafc' },
  cancelled: { label: 'Cancelled', color: 'var(--accent)', bg: '#fff1f2' },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('bookings')
        .select('*, vehicles(*), profiles:guest_id(*)')
        .order('created_at', { ascending: false });
      if (data) setBookings(data);
    }
    load();
  }, []);

  const filtered = bookings.filter(b => {
    const code = b.confirmation_code || b.id;
    const carName = `${b.vehicles?.make || ''} ${b.vehicles?.model || ''}`;
    const guestName = b.profiles?.full_name || '';
    const matchesSearch =
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>All Bookings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Master list of all reservations across the platform</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{bookings.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Total</div>
          </div>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>{bookings.filter(b => ['active', 'started'].includes(b.status)).length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Active Now</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search by Confirmation Code, Car, or Guest..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 14, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['all', 'pending', 'confirmed', 'active', 'started', 'completed', 'cancelled'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                  background: statusFilter === status ? 'var(--primary)' : 'white',
                  color: statusFilter === status ? 'white' : 'var(--text-dark)',
                  border: `1px solid ${statusFilter === status ? 'var(--primary)' : 'var(--border-light)'}`
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: '#f8fafc' }}>
                {['Booking Ref', 'Car & Location', 'Guest', 'Duration', 'Amount', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const st = STATUS_MAP[b.status] || STATUS_MAP.pending;
                const carImg = b.vehicles?.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80';
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px', minWidth: 150 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{b.confirmation_code || b.id.slice(0, 8)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td style={{ padding: '16px', minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={carImg} alt="car" style={{ width: 56, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{b.vehicles?.make} {b.vehicles?.model}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} /> {b.vehicles?.city}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', minWidth: 160 }}>
                      <div style={{ fontWeight: 600 }}>{b.profiles?.full_name || 'Unknown'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.profiles?.phone || ''}</div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, minWidth: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                        <CalendarIcon size={12} /> {new Date(b.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(b.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                      <div>{b.days} days · {b.plan || 'basic'}</div>
                    </td>
                    <td style={{ padding: '16px', minWidth: 120 }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 15 }}>₹{b.pricing?.total?.toLocaleString('en-IN') || '—'}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No bookings found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
