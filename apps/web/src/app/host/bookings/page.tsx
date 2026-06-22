'use client';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Key, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function HostBookingsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'started' | 'completed'>('upcoming');
  const [modalState, setModalState] = useState<{ isOpen: boolean, type: 'start' | 'end', tripId: string | null }>({ isOpen: false, type: 'start', tripId: null });
  
  const [inputOTP, setInputOTP] = useState('');
  const [damages, setDamages] = useState('');
  const [error, setError] = useState('');

  const loadTrips = async () => {
    const supabase = createClient();
    const userStr = localStorage.getItem('flexi_user');
    const hostId = userStr ? JSON.parse(userStr).id : '22222222-2222-2222-2222-222222222222';
    
    const { data } = await supabase.from('bookings').select('*, vehicles!inner(*)').eq('vehicles.host_id', hostId);
    
    if (data) {
      const formatted = data.map(b => ({
        ...b,
        car: {
          make: b.vehicles?.make,
          model: b.vehicles?.model,
          img: b.vehicles?.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
          city: b.vehicles?.city
        },
        earnings: Math.floor(b.pricing?.tripCost ? b.pricing.tripCost * 0.9 : 0),
        startDate: b.start_date,
        endDate: b.end_date,
        startTime: '10:00 AM',
        endTime: '10:00 AM',
        startOTP: b.start_otp,
        endOTP: b.end_otp
      }));
      setTrips(formatted);
    } else {
      setTrips([]);
    }
  };

  useEffect(() => { loadTrips(); }, []);

  const handleStartEndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!modalState.tripId) return;

    const supabase = createClient();
    const trip = trips.find(t => t.id === modalState.tripId);
    
    if (modalState.type === 'start') {
      if (trip.startOTP !== inputOTP) { setError('Invalid Start OTP'); return; }
      await supabase.from('bookings').update({ status: 'started' }).eq('id', trip.id);
    } else {
      if (trip.endOTP !== inputOTP) { setError('Invalid End OTP'); return; }
      const damagesArr = damages.trim() ? [damages.trim()] : [];
      await supabase.from('bookings').update({ status: 'completed', damages: damagesArr }).eq('id', trip.id);
    }
    closeModal();
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: 'start', tripId: null });
    setInputOTP('');
    setDamages('');
    setError('');
    loadTrips();
  };

  const filteredTrips = trips.filter(t => t.status === activeTab);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Trip Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your upcoming and active bookings.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-light)', paddingBottom: 16 }}>
        {['upcoming', 'started', 'completed'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className="btn"
            style={{ 
              background: activeTab === tab ? '#e0e7ff' : 'transparent', 
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: activeTab === tab ? 700 : 600,
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {filteredTrips.map(trip => (
          <div key={trip.id} className="card" style={{ padding: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <img src={trip.car.img} alt={trip.car.model} style={{ width: 200, height: 140, objectFit: 'cover', borderRadius: 12 }} />
            
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>{trip.car.make} {trip.car.model}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                    <MapPin size={14} /> {trip.car.city}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>₹{trip.earnings.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Host Earnings</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Start</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {trip.startTime}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>End</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{new Date(trip.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {trip.endTime}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Booking ID:</span> <span style={{ fontWeight: 600 }}>{trip.id}</span>
                </div>
                
                {trip.status === 'upcoming' && (
                  <button 
                    onClick={() => setModalState({ isOpen: true, type: 'start', tripId: trip.id })}
                    className="btn btn-primary" 
                    style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Key size={16} /> Start Trip
                  </button>
                )}
                
                {trip.status === 'started' && (
                  <button 
                    onClick={() => setModalState({ isOpen: true, type: 'end', tripId: trip.id })}
                    className="btn" 
                    style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: 'white', border: 'none' }}
                  >
                    <CheckCircle size={16} /> End Trip
                  </button>
                )}

                {trip.status === 'completed' && trip.damages && trip.damages.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 13, fontWeight: 600, background: '#fff1f2', padding: '6px 12px', borderRadius: 999 }}>
                    <AlertTriangle size={14} /> Damage Reported
                  </div>
                )}
              </div>
            </div>
            
            {/* For DEMO purposes we display the mock OTPs to the user so they can test the flow easily */}
            <div style={{ width: '100%', background: '#fefce8', padding: '12px 16px', borderRadius: 8, border: '1px solid #fef08a', fontSize: 12, color: '#a16207', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} /> <strong>Demo Info:</strong> Guest Start OTP: <code>{trip.startOTP}</code> | Guest End OTP: <code>{trip.endOTP}</code>
            </div>
          </div>
        ))}
        {filteredTrips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', background: 'white', borderRadius: 16, border: '1px solid var(--border-light)' }}>
            No {activeTab} trips found.
          </div>
        )}
      </div>

      {modalState.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{modalState.type === 'start' ? 'Start Trip' : 'End Trip'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              {modalState.type === 'start' 
                ? 'Ask the guest for their Start Trip OTP to hand over the keys and activate the booking.' 
                : 'Inspect the car and ask the guest for the End Trip OTP to close the booking.'}
            </p>

            {error && (
              <div style={{ background: '#fff1f2', color: 'var(--accent)', padding: 12, borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16, border: '1px solid #fecdd3' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleStartEndSubmit}>
              {modalState.type === 'end' && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Log Damages (Optional)</label>
                  <textarea 
                    value={damages} 
                    onChange={e => setDamages(e.target.value)} 
                    placeholder="Describe any new scratches or damages..." 
                    style={{ width: '100%', padding: 12, border: '1px solid var(--border-light)', borderRadius: 8, height: 80, fontSize: 14, resize: 'none' }} 
                  />
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Enter {modalState.type === 'start' ? 'Start' : 'End'} OTP</label>
                <input 
                  type="text" 
                  value={inputOTP} 
                  onChange={e => setInputOTP(e.target.value)} 
                  required 
                  maxLength={4}
                  placeholder="e.g. 1234"
                  style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--border-light)', borderRadius: 8, fontSize: 18, fontWeight: 800, letterSpacing: 4, textAlign: 'center' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={closeModal} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn" style={{ flex: 1, background: modalState.type === 'start' ? 'var(--primary)' : '#16a34a', color: 'white', border: 'none' }}>
                  Confirm {modalState.type === 'start' ? 'Start' : 'End'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
