'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#d97706', bg: '#fffbeb' },
  confirmed: { label: 'Confirmed', color: 'var(--primary)', bg: '#eff6ff' },
  upcoming: { label: 'Upcoming', color: 'var(--primary)', bg: '#eff6ff' },
  active: { label: 'Active', color: '#16a34a', bg: '#f0fdf4' },
  started: { label: 'In Progress', color: '#16a34a', bg: '#f0fdf4' },
  completed: { label: 'Completed', color: '#64748b', bg: '#f8fafc' },
  cancelled: { label: 'Cancelled', color: 'var(--accent)', bg: '#fff1f2' },
};

const TABS = ['all', 'upcoming', 'active', 'past', 'cancelled'];

export default function TripsPage() {
  const [tab, setTab] = useState('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      const supabase = createClient();
      const userStr = localStorage.getItem('flexi_user');
      if (!userStr) { setLoading(false); return; }

      const user = JSON.parse(userStr);
      const { data } = await supabase
        .from('bookings')
        .select('*, vehicles(*)')
        .eq('guest_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setBookings(data.map(b => ({
          ...b,
          car: {
            make: b.vehicles?.make,
            model: b.vehicles?.model,
            year: b.vehicles?.year,
            city: b.vehicles?.city,
            img: b.vehicles?.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
          },
          startDate: b.start_date,
          endDate: b.end_date,
          confirmationCode: b.confirmation_code,
        })));
      }
      setLoading(false);
    }
    loadTrips();
  }, []);

  const filtered = bookings.filter(t => {
    if (tab === 'all') return true;
    if (tab === 'upcoming') return ['confirmed', 'upcoming', 'pending'].includes(t.status);
    if (tab === 'active') return ['active', 'started'].includes(t.status);
    if (tab === 'past') return t.status === 'completed';
    if (tab === 'cancelled') return t.status === 'cancelled';
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>My Trips</h1>
        <p style={{ color: 'var(--text-secondary)' }}>All your past and upcoming car rentals</p>
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-secondary)' }}>Loading trips...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🚗</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No trips found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            {bookings.length === 0 ? "You haven't booked any cars yet. Start exploring!" : `You don't have any ${tab !== 'all' ? tab : ''} trips.`}
          </p>
          <Link href="/search" className="btn btn-primary">Find a car</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(trip => {
            const st = STATUS_MAP[trip.status] || STATUS_MAP.pending;
            return (
              <div key={trip.id} className="card" style={{ display: 'flex', overflow: 'hidden' }}>
                <img src={trip.car.img} alt={`${trip.car.make} ${trip.car.model}`} style={{ width: 180, height: 130, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 17 }}>{trip.car.year} {trip.car.make} {trip.car.model}</h3>
                      <span className="badge" style={{ background: st.bg, color: st.color, fontSize: 11 }}>{st.label}</span>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} />{trip.car.city}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} />
                        {new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(trip.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {trip.days} days
                      </span>
                    </div>
                    {trip.confirmationCode && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Booking: <strong style={{ color: 'var(--primary)' }}>{trip.confirmationCode}</strong>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>₹{trip.pricing?.total?.toLocaleString('en-IN') || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total paid</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
