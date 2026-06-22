'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, MapPin, Calendar, Clock, Star, Shield, AlertCircle, XCircle } from 'lucide-react';
import { getBookingById, updateBooking, type Booking } from '@/lib/store';
import { useRouter } from 'next/navigation';

import { use } from 'react';

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = getBookingById(unwrappedParams.id);
    if (data) setBooking(data);
  }, [unwrappedParams.id]);

  if (!booking) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Trip not found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This trip doesn't exist or you don't have access to it.</p>
        <Link href="/dashboard/trips" className="btn btn-primary">Back to Trips</Link>
      </div>
    );
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this trip?')) {
      updateBooking(booking.id, { status: 'cancelled' });
      setBooking({ ...booking, status: 'cancelled' });
    }
  };

  const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: '#d97706', bg: '#fffbeb' },
    confirmed: { label: 'Confirmed', color: 'var(--primary)', bg: '#eff6ff' },
    active: { label: 'Active', color: '#16a34a', bg: '#f0fdf4' },
    completed: { label: 'Completed', color: '#64748b', bg: '#f8fafc' },
    cancelled: { label: 'Cancelled', color: 'var(--accent)', bg: '#fff1f2' },
  };

  const st = STATUS_MAP[booking.status];
  const isCancellable = booking.status === 'confirmed' || booking.status === 'pending';

  return (
    <div style={{ maxWidth: 800 }}>
      <Link href="/dashboard/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 24, textDecoration: 'none' }}>
        <ChevronLeft size={18} /> Back to trips
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{booking.car.year} {booking.car.make} {booking.car.model}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
            <span className="badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
            <span style={{ color: 'var(--text-secondary)' }}>Conf: <strong style={{ color: 'var(--text-dark)' }}>{booking.confirmationCode}</strong></span>
          </div>
        </div>
        {isCancellable && (
          <button onClick={handleCancel} className="btn btn-outline" style={{ color: 'var(--accent)', borderColor: '#fda4af' }}>
            <XCircle size={16} /> Cancel Trip
          </button>
        )}
      </div>

      {booking.status === 'cancelled' && (
        <div style={{ padding: '16px 20px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, marginBottom: 24, display: 'flex', gap: 12 }}>
          <AlertCircle color="var(--accent)" />
          <div>
            <div style={{ fontWeight: 700, color: '#be123c', marginBottom: 4 }}>This trip was cancelled</div>
            <div style={{ fontSize: 13, color: '#9f1239' }}>Your refund of ₹{booking.pricing.total.toLocaleString('en-IN')} is being processed and will reflect in your account within 3-5 business days.</div>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden', marginBottom: 24 }}>
        <img src={booking.car.img} alt="Car" style={{ width: '100%', height: 240, objectFit: 'cover' }} />
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Pickup</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Calendar size={18} color="var(--primary)" style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{new Date(booking.startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>10:00 AM</div>
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Return</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Calendar size={18} color="var(--primary)" style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{new Date(booking.endDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>10:00 AM</div>
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Location</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <MapPin size={18} color="var(--primary)" style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{booking.car.city}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Exact address revealed 1 hr before trip</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Payment Receipt</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
              <span>Trip fee ({booking.days} days)</span><span>₹{booking.pricing.tripCost.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
              <span>Platform fee</span><span>₹{booking.pricing.platformFee.toLocaleString('en-IN')}</span>
            </div>
            {booking.pricing.protectionCost > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
                <span>Protection ({booking.plan})</span><span>₹{booking.pricing.protectionCost.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
          <div style={{ borderTop: '1.5px solid var(--border-light)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, color: 'var(--text-dark)' }}>
            <span>Total Paid</span><span>₹{booking.pricing.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Host Details</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>
              {booking.car.host[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{booking.car.host}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                <Star size={12} color="#f5a623" fill="#f5a623" /> 4.9 (124 reviews)
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button className="btn btn-outline" style={{ flex: 1, padding: '10px 0' }}>Message Host</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '10px 0' }}>Call Host</button>
          </div>
        </div>
      </div>
    </div>
  );
}
