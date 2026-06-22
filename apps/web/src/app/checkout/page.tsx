'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Shield, CheckCircle, CreditCard, Lock, MapPin, Calendar, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const PROTECTION_FEES: Record<string, number> = { basic: 0, standard: 299, premium: 499 };
const PLAN_LABELS: Record<string, { label: string; excess: string }> = {
  basic: { label: 'Basic', excess: '₹50,000 excess liability' },
  standard: { label: 'Standard', excess: '₹10,000 excess liability' },
  premium: { label: 'Premium', excess: 'Zero excess liability' },
};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateConfirmationCode() {
  return 'FLX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const carId = searchParams.get('car') || '';
  const startDate = searchParams.get('start') || new Date().toISOString().split('T')[0];
  const endDate = searchParams.get('end') || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  const plan = (searchParams.get('plan') || 'basic') as 'basic' | 'standard' | 'premium';

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [kycVerified, setKycVerified] = useState(false);
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [bookingTotal, setBookingTotal] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Load car from DB
      if (carId) {
        const { data } = await supabase.from('vehicles').select('*, profiles:host_id(full_name)').eq('id', carId).single();
        if (data) setCar(data);
      }

      // Check KYC status
      const userStr = localStorage.getItem('flexi_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const { data: kycData } = await supabase.from('kyc_records').select('status').eq('user_id', user.id).eq('status', 'verified').maybeSingle();
        setKycVerified(!!kycData);
      }

      setLoading(false);
    }
    load();
  }, [carId]);

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={32} className="spinner" /></div>;

  if (!car) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Car not found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>The car you're trying to book doesn't exist.</p>
        <Link href="/search" className="btn btn-primary">Browse Cars</Link>
      </div>
    );
  }

  const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
  const tripCost = car.price * days;
  const platformFee = Math.round(tripCost * 0.1);
  const protectionCost = PROTECTION_FEES[plan] * days;
  const total = tripCost + platformFee + protectionCost;
  const carImg = car.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
  const hostName = car.profiles?.full_name || 'Unknown Host';

  const handlePay = async () => {
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) return;

    const userStr = localStorage.getItem('flexi_user');
    if (!userStr) {
      window.dispatchEvent(new Event('open-auth-modal'));
      return;
    }

    setProcessing(true);

    const supabase = createClient();
    const user = JSON.parse(userStr);
    const code = generateConfirmationCode();
    const startOtp = generateOTP();
    const endOtp = generateOTP();

    const { error } = await supabase.from('bookings').insert({
      car_id: car.id,
      guest_id: user.id,
      start_date: startDate,
      end_date: endDate,
      days,
      plan,
      pricing: { dailyRate: car.price, tripCost, platformFee, protectionCost, total },
      status: 'confirmed',
      start_otp: startOtp,
      end_otp: endOtp,
      confirmation_code: code,
    });

    if (error) {
      console.error('Booking error:', error);
      alert('Error creating booking: ' + error.message);
      setProcessing(false);
      return;
    }

    setConfirmationCode(code);
    setBookingTotal(total);
    setStep(3);
    setProcessing(false);
  };

  const formatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .checkout-container { max-width: 1040px; margin: 0 auto; padding: 32px 20px 80px; }
        .checkout-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: start; }
        @media (max-width: 820px) { .checkout-grid { grid-template-columns: 1fr; } }
        .checkout-card { background: white; border-radius: 20px; border: 1.5px solid var(--border-light); padding: 32px; box-shadow: var(--shadow-sm); }
        .checkout-section-title { font-size: 18px; font-weight: 800; color: var(--text-dark); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .checkout-input { width: 100%; padding: 14px 16px; border: 1.5px solid var(--border-light); border-radius: 12px; font-size: 15px; font-weight: 500; outline: none; transition: all 0.2s; color: var(--text-dark); }
        .checkout-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(84, 51, 176, 0.1); }
        .checkout-input::placeholder { color: #94a3b8; }
        .checkout-label { font-size: 13px; font-weight: 700; color: var(--text-dark); margin-bottom: 6px; display: block; }
        .pay-btn { width: 100%; background: var(--primary); color: white; border: none; padding: 16px; border-radius: 14px; font-size: 16px; font-weight: 800; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .pay-btn:hover:not(:disabled) { background: #43229f; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(84, 51, 176, 0.25); }
        .pay-btn:disabled { background: #cbd5e1; cursor: not-allowed; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .success-icon { animation: pulse 0.6s ease; }
      `}</style>

      <div className="checkout-container">
        <Link href={`/cars/${carId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 24, textDecoration: 'none' }}>
          <ChevronLeft size={18} /> Back to car
        </Link>

        {step === 3 ? (
          <div className="fade-up" style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center' }}>
            <div className="success-icon" style={{ width: 100, height: 100, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
              <CheckCircle size={48} color="#16a34a" />
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.03em' }}>Booking Confirmed! 🎉</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32 }}>Your trip has been successfully booked. You'll receive a confirmation shortly.</p>

            <div className="checkout-card" style={{ textAlign: 'left', marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <img src={carImg} alt={`${car.make} ${car.model}`} style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 12 }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{car.year} {car.make} {car.model}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {car.city}</div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 2 }}>Confirmation</div><div style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)' }}>{confirmationCode}</div></div>
                <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 2 }}>Status</div><div style={{ fontWeight: 700, fontSize: 14, color: '#16a34a' }}>Confirmed ✓</div></div>
                <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 2 }}>Dates</div><div style={{ fontWeight: 600, fontSize: 13 }}>{new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
                <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 2 }}>Total Paid</div><div style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)' }}>₹{bookingTotal.toLocaleString('en-IN')}</div></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/dashboard/trips" className="btn btn-primary" style={{ padding: '14px 28px' }}>View My Trips</Link>
              <Link href="/search" className="btn btn-outline" style={{ padding: '14px 28px' }}>Book Another Car</Link>
            </div>
          </div>
        ) : (
          <div className="checkout-grid">
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 28, letterSpacing: '-0.03em' }}>Checkout</h1>

              {/* Trip Summary */}
              <div className="checkout-card fade-up" style={{ marginBottom: 24 }}>
                <h2 className="checkout-section-title"><Calendar size={20} color="var(--primary)" /> Trip Summary</h2>
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <img src={carImg} alt={`${car.make} ${car.model}`} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 14, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{car.year} {car.make} {car.model}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}><MapPin size={12} /> {car.city}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Host: {hostName} · {car.fuel} · {car.transmission} · {car.seats} seats</div>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 2 }}>Pickup</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{new Date(startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>10:00 AM</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 2 }}>Return</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{new Date(endDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>10:00 AM</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                  Protection: <strong style={{ color: 'var(--text-dark)' }}>{PLAN_LABELS[plan].label}</strong> — {PLAN_LABELS[plan].excess}
                </div>
              </div>

              {/* KYC Gate */}
              <div className="checkout-card fade-up" style={{ marginBottom: 24 }}>
                <h2 className="checkout-section-title"><Shield size={20} color={kycVerified ? '#16a34a' : '#d97706'} /> Identity Verification</h2>
                {kycVerified ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12 }}>
                    <CheckCircle size={20} color="#16a34a" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#166534', fontSize: 14 }}>Identity Verified</div>
                      <div style={{ fontSize: 12, color: '#15803d' }}>Your KYC verification is complete. You're ready to book.</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '14px 18px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12 }}>
                    <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14, marginBottom: 4 }}>KYC Required</div>
                    <div style={{ fontSize: 13, color: '#b45309', marginBottom: 12 }}>You must complete identity verification before booking.</div>
                    <Link href="/dashboard/kyc" className="btn btn-sm" style={{ background: '#d97706', color: 'white', padding: '8px 16px', fontSize: 13, borderRadius: 999 }}>Complete KYC →</Link>
                  </div>
                )}
              </div>

              {/* Payment Form */}
              <div className="checkout-card fade-up">
                <h2 className="checkout-section-title"><CreditCard size={20} color="var(--primary)" /> Payment Details</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={13} /> Your payment information is secured with 256-bit encryption.
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label className="checkout-label">Card Number</label>
                  <input className="checkout-input" placeholder="4242 4242 4242 4242" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} maxLength={19} disabled={!kycVerified} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="checkout-label">Expiry Date</label>
                    <input className="checkout-input" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} maxLength={5} disabled={!kycVerified} />
                  </div>
                  <div>
                    <label className="checkout-label">CVV</label>
                    <input className="checkout-input" placeholder="123" type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} disabled={!kycVerified} />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label className="checkout-label">Name on Card</label>
                  <input className="checkout-input" placeholder="Full name as on card" value={cardName} onChange={e => setCardName(e.target.value)} disabled={!kycVerified} />
                </div>

                <button className="pay-btn" onClick={handlePay} disabled={!kycVerified || processing || !cardNumber || !cardExpiry || !cardCvv || !cardName}>
                  {processing ? <><Loader2 size={18} className="spinner" /> Processing...</> : <>Pay ₹{total.toLocaleString('en-IN')} <ArrowRight size={16} /></>}
                </button>

                <p style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 12 }}>
                  Demo mode: Use any card number. No real charges will be made.
                </p>
              </div>
            </div>

            {/* Right Column - Price Summary */}
            <div>
              <div className="checkout-card" style={{ position: 'sticky', top: 100 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, color: 'var(--text-dark)' }}>Price Breakdown</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {[
                    [`Trip cost (₹${car.price.toLocaleString('en-IN')} × ${days} days)`, `₹${tripCost.toLocaleString('en-IN')}`],
                    ['Platform fee (10%)', `₹${platformFee.toLocaleString('en-IN')}`],
                    ...(protectionCost > 0 ? [[`Protection (${PLAN_LABELS[plan].label})`, `₹${protectionCost.toLocaleString('en-IN')}`]] : []),
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
                      <span>{label}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{val}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1.5px solid var(--border-light)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 20, color: 'var(--text-dark)' }}>
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ marginTop: 20, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
                  <strong>Free cancellation</strong> up to 24 hours before pickup. Refundable security deposit of ₹{car.deposit?.toLocaleString('en-IN') || '5,000'} collected separately.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}><Loader2 size={32} className="spinner" style={{ display: 'inline-block' }} /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
