'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, Calendar, Shield, ArrowRight, MapPin, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [kycStatus, setKycStatus] = useState<string>('not_submitted');
  const [totalTrips, setTotalTrips] = useState(0);
  const [upcomingTrip, setUpcomingTrip] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const userStr = localStorage.getItem('flexi_user');
      if (!userStr) return;

      const user = JSON.parse(userStr);

      // Load profile name
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      if (profile) setUserName(profile.full_name?.split(' ')[0] || '');

      // Load KYC status
      const { data: kyc } = await supabase.from('kyc_records').select('status').eq('user_id', user.id).maybeSingle();
      setKycStatus(kyc?.status || 'not_submitted');

      // Load bookings
      const { data: bookings } = await supabase.from('bookings').select('*, vehicles(*)').eq('guest_id', user.id).order('start_date', { ascending: true });

      if (bookings) {
        setTotalTrips(bookings.length);

        const now = new Date();
        const upcoming = bookings.find(b =>
          ['confirmed', 'upcoming', 'pending'].includes(b.status) && new Date(b.start_date) >= now
        );

        if (upcoming) {
          setUpcomingTrip({
            ...upcoming,
            car: {
              make: upcoming.vehicles?.make,
              model: upcoming.vehicles?.model,
              year: upcoming.vehicles?.year,
              city: upcoming.vehicles?.city,
              img: upcoming.vehicles?.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
            },
            startDate: upcoming.start_date,
            endDate: upcoming.end_date,
          });
        }
      }
    }
    load();
  }, []);

  const kycLabel = kycStatus === 'verified' ? 'Verified ✅' : kycStatus === 'pending' ? 'Pending' : 'Not Done';

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Welcome back{userName ? `, ${userName}` : ''}! 👋</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Here's what's happening with your trips.</p>
      </div>

      {/* KYC Alert — only show if NOT verified */}
      {kycStatus !== 'verified' && (
        <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a', borderRadius: 14, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield size={22} color="#d97706" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#92400e' }}>Complete KYC to book cars</div>
              <div style={{ fontSize: 13, color: '#b45309' }}>Upload your driving licence and ID proof to get verified.</div>
            </div>
          </div>
          <Link href="/dashboard/kyc" className="btn btn-sm" style={{ background: '#d97706', color: 'white' }}>Verify Now <ArrowRight size={14} /></Link>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { icon: '🚗', label: 'Total Trips', value: String(totalTrips), color: '#eff6ff', iconColor: 'var(--primary)' },
          { icon: '⭐', label: 'Avg. Rating', value: totalTrips > 0 ? '4.8' : '—', color: '#fffbeb', iconColor: '#d97706' },
          { icon: '💬', label: 'Messages', value: '0', color: '#f0fdf4', iconColor: '#16a34a' },
          { icon: '🛡️', label: 'KYC Status', value: kycLabel, color: kycStatus === 'verified' ? '#f0fdf4' : '#fff1f2', iconColor: kycStatus === 'verified' ? '#16a34a' : 'var(--accent)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color, color: s.iconColor, fontSize: 22 }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Upcoming Trip */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>Upcoming Trip</h3>
              <Link href="/dashboard/trips" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View all</Link>
            </div>
          </div>
          {upcomingTrip ? (
            <div style={{ display: 'flex', gap: 0 }}>
              <img src={upcomingTrip.car.img} alt="Trip car" style={{ width: 140, height: 140, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ padding: '16px 16px 20px', flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{upcomingTrip.car.year} {upcomingTrip.car.make} {upcomingTrip.car.model}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} />{upcomingTrip.car.city}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} />
                  {new Date(upcomingTrip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} →{' '}
                  {new Date(upcomingTrip.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <span className="badge badge-primary" style={{ fontSize: 11, textTransform: 'capitalize' }}>{upcomingTrip.status}</span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🚗</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>No upcoming trips</p>
              <Link href="/search" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>Find a car →</Link>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { href: '/search', emoji: '🔍', label: 'Browse Cars', desc: 'Find your next ride' },
              { href: '/dashboard/kyc', emoji: '🛡️', label: 'KYC Verification', desc: kycStatus === 'verified' ? 'Verified ✅' : 'Complete to unlock booking' },
              { href: '/dashboard/trips', emoji: '📅', label: 'My Trips', desc: `${totalTrips} total trip${totalTrips !== 1 ? 's' : ''}` },
              { href: '/dashboard/profile', emoji: '👤', label: 'Edit Profile', desc: 'Update your info' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid var(--border-light)', borderRadius: 10, textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                <span style={{ fontSize: 22 }}>{item.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-dark)' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
                <ArrowRight size={16} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
