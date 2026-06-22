'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Shield, Zap, Users, Fuel, Settings, ChevronLeft, ChevronRight, Heart, Share2, X, CigaretteOff, Bluetooth, Sun, Camera, Smartphone, Gauge, Thermometer, Volume2, Sparkles, Calendar, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const FALLBACK_CAR = {
  id: '1', make: 'Hyundai', model: 'Creta', year: 2023, type: 'SUV', price: 2999,
  rating: 4.9, reviews: 47, city: 'Mumbai, Maharashtra', address: 'Bandra West, Mumbai',
  fuel: 'Petrol', transmission: 'Automatic', seats: 5, color: 'Pearl White',
  description: 'Experience the perfect blend of style and performance with the 2023 Hyundai Creta. This well-maintained SUV comes fully loaded with all premium features. I keep it clean and well-maintained. Perfect for city drives and highway trips alike.',
  features: ['GPS Navigation', 'Bluetooth', 'Sunroof', 'Backup Camera', 'Apple CarPlay', 'Android Auto', 'Cruise Control', 'Heated Seats', 'Premium Sound'],
  images: [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
  ],
  host: { name: 'Rahul S.', rating: 4.95, trips: 124, response_time: '< 1 hour', member_since: '2022', is_all_star: true, avatar: 'R' },
  security_deposit: 5000,
  cancellation: 'Free cancellation up to 24 hours before pickup',
  instant_book: true,
  reviews_data: [
    { name: 'Aisha T.', rating: 5, comment: 'Fantastic car and amazing host! The Creta was spotless and drove beautifully. Highly recommended!', date: '2 weeks ago', avatar: 'A' },
    { name: 'Karan M.', rating: 5, comment: 'Perfect road trip car. Rahul was very responsive and the handover was super smooth.', date: '1 month ago', avatar: 'K' },
    { name: 'Divya P.', rating: 4, comment: 'Great car, as described. Minor parking issue but Rahul resolved it quickly. Will book again.', date: '6 weeks ago', avatar: 'D' },
  ],
};

const SIMILAR_CARS = [
  { id: '4', make: 'Maruti', model: 'Brezza', year: 2023, type: 'SUV', price: 1999, rating: 4.7, reviews: 63, city: 'Mumbai', host: 'Sneha R.', instant: true, img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80' },
  { id: '6', make: 'Kia', model: 'Seltos', year: 2023, type: 'SUV', price: 2799, rating: 4.9, reviews: 29, city: 'Mumbai', host: 'Divya N.', instant: true, img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80' },
  { id: '8', make: 'Mahindra', model: 'XUV700', year: 2023, type: 'SUV', price: 3799, rating: 4.8, reviews: 22, city: 'Mumbai', host: 'Rohan B.', instant: true, img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80' },
];

const TIME_OPTIONS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM',
  '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
];

const getFeatureIcon = (feature: string) => {
  switch (feature.toLowerCase()) {
    case 'gps navigation': return <MapPin size={16} />;
    case 'bluetooth': return <Bluetooth size={16} />;
    case 'sunroof': return <Sun size={16} />;
    case 'backup camera': return <Camera size={16} />;
    case 'apple carplay': return <Smartphone size={16} />;
    case 'android auto': return <Smartphone size={16} />;
    case 'cruise control': return <Gauge size={16} />;
    case 'heated seats': return <Thermometer size={16} />;
    case 'premium sound': return <Volume2 size={16} />;
    default: return <Sparkles size={16} />;
  }
};

import { use } from 'react';

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [plan, setPlan] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [liked, setLiked] = useState(false);
  const router = useRouter();

  // Photo Scroll Overlay States
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    async function loadCar() {
      const supabase = createClient();
      const { data } = await supabase.from('vehicles').select('*, profiles:host_id(full_name, email)').eq('id', unwrappedParams.id).single();
      
      if (data) {
        setCar({
          id: data.id,
          make: data.make,
          model: data.model,
          year: data.year,
          type: data.type,
          price: data.price,
          rating: 5.0, // New cars start with 5.0
          reviews: 0,
          city: data.city,
          address: data.address || data.city,
          fuel: data.fuel,
          transmission: data.transmission,
          seats: data.seats,
          color: data.color || 'Unknown',
          description: data.description || FALLBACK_CAR.description,
          features: data.features?.length ? data.features : FALLBACK_CAR.features,
          images: data.images?.length ? data.images : FALLBACK_CAR.images,
          host: { name: data.profiles?.full_name || 'Unknown', rating: 5.0, trips: 0, response_time: '< 1 hour', member_since: new Date().getFullYear().toString(), is_all_star: false, avatar: (data.profiles?.full_name || 'U')[0] },
          security_deposit: data.deposit || 0,
          cancellation: 'Free cancellation up to 24 hours before pickup',
          instant_book: data.instant_book ?? true,
          reviews_data: []
        });
      } else {
        setCar(FALLBACK_CAR);
      }
      setLoading(false);
    }
    loadCar();
  }, [unwrappedParams.id]);

  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 1;
  const protectionFees = { basic: 0, standard: 299, premium: 499 };

  // Prevent background scroll when photo overlay is open
  useEffect(() => {
    if (showLightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showLightbox]);

  if (loading) return <div style={{ padding: 100, textAlign: 'center', fontSize: 18 }}>Loading vehicle details...</div>;
  const CAR = car || FALLBACK_CAR;

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;
    
    // Check auth status from localStorage directly for demo
    const isLogged = !!localStorage.getItem('flexi_user');
    
    if (!isLogged) {
      // Trigger auth modal
      window.dispatchEvent(new Event('open-auth-modal'));
    } else {
      // User is logged in, proceed to checkout
      router.push(`/checkout?car=${CAR.id}&start=${startDate}&end=${endDate}&plan=${plan}`);
    }
  };

  const base = CAR.price * days;
  const platformFee = Math.round(base * 0.1);
  const protection = protectionFees[plan] * days;
  const total = base + platformFee + protection;

  return (
    <div style={{ maxWidth: 1040, margin: '24px auto', padding: '0 20px 60px' }}>
      <style>{`
        .turo-specs-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px 32px;
          padding: 24px 0;
          border-bottom: 1px solid var(--border-light);
        }
        .turo-spec-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .turo-spec-icon {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }
        .turo-spec-text {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-dark);
        }
        .turo-section-title {
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-dark);
          margin-bottom: 20px;
        }
        .features-flex {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .feature-pill {
          padding: 10px 20px;
          border: 1.5px solid var(--border-light);
          background: transparent;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-dark);
          display: flex;
          align-items: center;
          gap: 8px;
          transition: var(--transition);
        }
        .feature-pill:hover {
          border-color: var(--text-secondary);
        }
        .host-details-flex {
          display: flex;
          gap: 20px;
          align-items: center;
          padding: 12px 0 24px;
          border-bottom: 1.5px solid var(--border-light);
        }
        .host-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px 24px;
          margin-top: 24px;
        }
        .host-stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .host-stat-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .host-stat-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-dark);
        }
        .guidelines-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .guideline-item {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          font-size: 15px;
          line-height: 1.5;
        }
        .guideline-icon {
          color: var(--text-secondary);
          margin-top: 3px;
          flex-shrink: 0;
        }
        .guideline-text {
          color: var(--text-dark);
        }
        .review-item {
          padding: 24px 0;
          border-bottom: 1px solid var(--border-light);
        }
        .review-item:last-child {
          border-bottom: none;
        }
        .booking-widget-boxed {
          background: #ffffff;
          border-radius: 24px;
          border: 1.5px solid var(--border-light);
          padding: 32px;
          box-shadow: var(--shadow-md);
          position: sticky;
          top: 100px;
        }
        .booking-field-group {
          border: 1.5px solid var(--border-light);
          border-radius: 12px;
          overflow: hidden;
          background: #ffffff;
          margin-bottom: 16px;
        }
        .booking-field-row {
          display: flex;
          padding: 12px 16px;
          border-bottom: 1.5px solid var(--border-light);
          align-items: center;
          gap: 12px;
        }
        .booking-field-row:last-of-type {
          border-bottom: none;
        }
        .booking-input-block {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .booking-input-block label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .booking-input-block input, .booking-input-block select {
          border: none;
          outline: none;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dark);
          background: transparent;
          width: 100%;
        }
        @media (max-width: 820px) {
          .detail-columns {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .turo-specs-container {
            grid-template-columns: repeat(2, 1fr);
          }
          .booking-widget-boxed {
            position: static;
          }
        }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
        <Link href="/search" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={16} /> Search results
        </Link>
        <span>/</span><span>{CAR.make}</span><span>/</span><span style={{ color: 'var(--text-dark)' }}>{CAR.model}</span>
      </div>

      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em', color: 'var(--text-dark)' }}>{CAR.year} {CAR.make} {CAR.model}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} color="#f5a623" fill="#f5a623" /><strong>{CAR.rating}</strong><span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>({CAR.reviews} reviews)</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: 13 }}><MapPin size={14} />{CAR.city}</div>
            {CAR.instant_book && <span className="badge badge-primary" style={{ padding: '4px 10px', fontSize: 11 }}><Zap size={11} /> Instant Book</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setLiked(!liked)} style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border-light)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: liked ? 'var(--accent)' : 'var(--text-secondary)', transition: 'var(--transition)' }}>
            <Heart size={18} fill={liked ? 'var(--accent)' : 'none'} />
          </button>
          <button style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border-light)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Image Gallery (Contained Boxed Layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '220px 220px', gap: 8, marginBottom: 40, borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {CAR.images.slice(0, 5).map((img, i) => (
          <div key={i} style={{ gridColumn: i === 0 ? '1' : undefined, gridRow: i === 0 ? '1 / 3' : undefined, overflow: 'hidden', cursor: 'pointer', position: 'relative' }} onClick={() => setShowLightbox(true)}>
            <img src={img} alt={`View ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
            {i === 4 && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15 }}>View all photos</div>}
          </div>
        ))}
      </div>

      {/* Columns Layout */}
      <div className="detail-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>
        {/* Left Side */}
        <div>
          {/* Specs Boxed Grid */}
          <div className="turo-specs-container">
            {[
              { icon: <Fuel size={20} />, text: CAR.fuel },
              { icon: <Settings size={20} />, text: CAR.transmission },
              { icon: <Users size={20} />, text: `${CAR.seats} seats` },
              { icon: <Calendar size={20} />, text: `${CAR.year} model` },
            ].map(({ icon, text }, i) => (
              <div key={i} className="turo-spec-item">
                <div className="turo-spec-icon">{icon}</div>
                <div className="turo-spec-text">{text}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ padding: '32px 0', borderBottom: '1.5px solid var(--border-light)' }}>
            <h2 className="turo-section-title">Description</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15 }}>{CAR.description}</p>
          </div>

          {/* Amenities Features Outlined Pills */}
          <div style={{ padding: '32px 0', borderBottom: '1.5px solid var(--border-light)' }}>
            <h2 className="turo-section-title">Features</h2>
            <div className="features-flex">
              {CAR.features.map(f => (
                <div key={f} className="feature-pill">
                  <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                    {getFeatureIcon(f)}
                  </span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meet your host */}
          <div style={{ padding: '32px 0', borderBottom: '1.5px solid var(--border-light)' }}>
            <h2 className="turo-section-title">Hosted by</h2>
            <div className="host-details-flex">
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>{CAR.host.avatar}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>{CAR.host.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
                  {CAR.host.is_all_star && <span style={{ color: '#f5a623', fontWeight: 600 }}>All-Star Host</span>}
                  {CAR.host.is_all_star && <span>·</span>}
                  <span>{CAR.host.trips} trips</span>
                  <span>·</span>
                  <span>Joined {CAR.host.member_since}</span>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '24px 0 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 20 }}>{CAR.host.name} is an All-Star Host, representing the top tier of hosts on Flexi who consistently deliver outstanding experiences.</p>
              
              <div className="host-stats-grid">
                <div className="host-stat-item">
                  <div className="host-stat-label">Response time</div>
                  <div className="host-stat-value">{CAR.host.response_time}</div>
                </div>
                <div className="host-stat-item">
                  <div className="host-stat-label">Response rate</div>
                  <div className="host-stat-value">100%</div>
                </div>
              </div>

              <button className="btn btn-outline btn-sm" style={{ marginTop: 24, borderRadius: '8px', border: '1.5px solid var(--primary)', color: 'var(--primary)' }}>Message host</button>
            </div>
          </div>

          {/* Guidelines Section */}
          <div style={{ padding: '32px 0', borderBottom: '1.5px solid var(--border-light)' }}>
            <h2 className="turo-section-title">Guidelines</h2>
            <div className="guidelines-list">
              <div className="guideline-item">
                <div className="guideline-icon"><CigaretteOff size={18} /></div>
                <div className="guideline-text">
                  <strong>No smoking</strong>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
                    A cleaning fee of up to ₹5,000 may be charged for smoking in the vehicle.
                  </div>
                </div>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon"><Fuel size={18} /></div>
                <div className="guideline-text">
                  <strong>Refuel policy</strong>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Please return the vehicle with the same fuel level as when the trip started.
                  </div>
                </div>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon"><Info size={18} /></div>
                <div className="guideline-text">
                  <strong>Keep it clean</strong>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Return the vehicle in a clean condition to avoid extra cleaning charges.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rules of the road */}
          <div style={{ padding: '32px 0', borderBottom: '1.5px solid var(--border-light)' }}>
            <h2 className="turo-section-title">Rules of the road</h2>
            <div className="guidelines-list">
              <div className="guideline-item">
                <div className="guideline-icon"><Users size={18} /></div>
                <div className="guideline-text">
                  <strong>Authorized drivers only</strong>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Only drivers listed on the reservation are authorized to drive the car. Additional drivers must be added and approved through the app.
                  </div>
                </div>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon"><Shield size={18} /></div>
                <div className="guideline-text">
                  <strong>Age & licensing</strong>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
                    You must be at least 21 years old and hold a valid driver's license to book this vehicle.
                  </div>
                </div>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon"><MapPin size={18} /></div>
                <div className="guideline-text">
                  <strong>No off-roading</strong>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Off-roading, racing, or using the vehicle on unpaved roads is strictly prohibited.
                  </div>
                </div>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon"><Info size={18} /></div>
                <div className="guideline-text">
                  <strong>Telemetry and tracking disclosure</strong>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
                    This vehicle is equipped with location and telemetry tracking devices for insurance and security.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div style={{ padding: '32px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <h2 className="turo-section-title" style={{ marginBottom: 0 }}>Reviews</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fffbeb', padding: '4px 12px', border: '1px solid #fcd34d', borderRadius: 999 }}>
                <Star size={13} color="#f5a623" fill="#f5a623" />
                <strong style={{ fontSize: 14 }}>{CAR.rating}</strong>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>({CAR.reviews})</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {CAR.reviews_data.map((r, i) => (
                <div key={i} className="review-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {r.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-dark)' }}>{r.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={11} color={j < r.rating ? "#f5a623" : "#e2e8f0"} fill={j < r.rating ? "#f5a623" : "none"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.date}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side sticky Booking Card */}
        <div>
          <div className="booking-widget-boxed">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>₹{CAR.price.toLocaleString('en-IN')} <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--text-secondary)' }}>/day</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}><Star size={13} color="#f5a623" fill="#f5a623" /> {CAR.rating}</div>
            </div>

            {/* Date/Time Selector Grid (Turo Style) */}
            <div className="booking-field-group">
              <div className="booking-field-row">
                <div className="booking-input-block" style={{ borderRight: '1.5px solid var(--border-light)', paddingRight: 10 }}>
                  <label>Trip Start</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="booking-input-block">
                  <label>Time</label>
                  <select defaultValue="10:00 AM">
                    {TIME_OPTIONS.map(time => <option key={time} value={time}>{time}</option>)}
                  </select>
                </div>
              </div>
              <div className="booking-field-row">
                <div className="booking-input-block" style={{ borderRight: '1.5px solid var(--border-light)', paddingRight: 10 }}>
                  <label>Trip End</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className="booking-input-block">
                  <label>Time</label>
                  <select defaultValue="10:00 AM">
                    {TIME_OPTIONS.map(time => <option key={time} value={time}>{time}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Protection Plans */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Protection Plan</div>
              {[
                { key: 'basic', label: 'Basic', price: 0, excess: '₹50,000 Excess Liability' },
                { key: 'standard', label: 'Standard', price: 299, excess: '₹10,000 Excess Liability' },
                { key: 'premium', label: 'Premium', price: 499, excess: 'Zero Excess Liability' },
              ].map(p => (
                <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1.5px solid', borderColor: plan === p.key ? 'var(--primary)' : 'var(--border-light)', borderRadius: 12, cursor: 'pointer', marginBottom: 8, background: plan === p.key ? '#eff6ff' : 'white', transition: 'var(--transition)' }}>
                  <input type="radio" name="plan" value={p.key} checked={plan === p.key as any} onChange={() => setPlan(p.key as any)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-dark)' }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{p.excess}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-dark)' }}>{p.price === 0 ? 'Free' : `₹${p.price}/day`}</div>
                </label>
              ))}
            </div>

            {/* Price Breakdown */}
            {startDate && endDate && (
              <div style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border-light)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
                {[
                  [`Trip cost (₹${CAR.price.toLocaleString('en-IN')} × ${days} d)`, `₹${base.toLocaleString('en-IN')}`],
                  [`Platform fee (10%)`, `₹${platformFee.toLocaleString('en-IN')}`],
                  ...(protection > 0 ? [[`Protection cover`, `₹${protection.toLocaleString('en-IN')}`]] : []),
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    <span>{label}</span><span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{val}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12, marginTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, color: 'var(--text-dark)' }}>
                  <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            <button onClick={handleBookClick} className="btn btn-primary btn-lg btn-full" style={{ marginBottom: 12, borderRadius: '12px', padding: '14px 28px' }} disabled={!startDate || !endDate}>
              {startDate && endDate ? `Book for ₹${total.toLocaleString('en-IN')}` : 'Check availability'}
            </button>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.4 }}>{CAR.cancellation}</p>

            <div style={{ marginTop: 20, padding: '14px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Shield size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: '#166534', lineHeight: 1.5 }}>Fully refundable security deposit of <strong>₹{CAR.security_deposit.toLocaleString('en-IN')}</strong> will be returned post-trip.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar cars for your dates */}
      <div style={{ marginTop: 64, paddingTop: 48, borderTop: '1.5px solid var(--border-light)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 24, letterSpacing: '-0.02em' }}>Similar cars for your dates</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {SIMILAR_CARS.map(car => (
            <Link key={car.id} href={`/cars/${car.id}`} className="car-card">
              <div className="car-card-image">
                <img src={car.img} alt={`${car.make} ${car.model}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {car.instant && <span className="car-card-badge">⚡ Instant Book</span>}
                <div className="car-card-rating">★ {car.rating}</div>
              </div>
              <div className="car-card-body">
                <div className="car-card-title">{car.year} {car.make} {car.model}</div>
                <div className="car-card-location">
                  <MapPin size={12} style={{ flexShrink: 0 }} />
                  {car.city} · {car.reviews} reviews
                </div>
                <div className="car-card-footer">
                  <div className="car-card-price">₹{car.price.toLocaleString('en-IN')} <span>/day</span></div>
                  <div style={{ fontSize: 12, color: '#5f5f5f', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                      {car.host[0]}
                    </div>
                    {car.host}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Turo-style Photo Feed Scroll Overlay */}
      {showLightbox && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: '#ffffff', overflowY: 'auto',
          animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            position: 'sticky', top: 0, background: '#ffffff', borderBottom: '1px solid var(--border-light)',
            height: 72, padding: '0 24px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', zIndex: 2100
          }}>
            <button
              onClick={() => setShowLightbox(false)}
              style={{
                background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 15, fontWeight: 700, color: 'var(--text-dark)', cursor: 'pointer'
              }}
            >
              <ChevronLeft size={20} /> Back to detail page
            </button>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
              All Photos ({CAR.images.length})
            </div>
            <div style={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLightbox(false)}
                style={{
                  border: 'none', cursor: 'pointer',
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-secondary)'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Dual Columns Content */}
          <div style={{ maxWidth: 1040, margin: '40px auto', padding: '0 20px 60px', display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 48, width: '100%' }}>
            {/* Left: Scrollable Photo Feed */}
            <div>
              {CAR.images.map((img, i) => (
                <div key={i} style={{ marginBottom: 20, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <img src={img} alt={`Car Photo ${i + 1}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              ))}
            </div>

            {/* Right: Sticky Summary Card */}
            <div>
              <div style={{ position: 'sticky', top: 112, background: 'white', borderRadius: 20, border: '1.5px solid var(--border-light)', padding: 24, boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-dark)', marginBottom: 6 }}>{CAR.year} {CAR.make} {CAR.model}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                  <Star size={13} color="#f5a623" fill="#f5a623" />
                  <strong style={{ fontSize: 13, color: 'var(--text-dark)' }}>{CAR.rating}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>({CAR.reviews} reviews)</span>
                </div>

                <div style={{ height: 1, background: 'var(--border-light)', marginBottom: 20 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Daily rental rate</span>
                  <strong style={{ fontSize: 20, color: 'var(--primary)', fontWeight: 900 }}>₹{CAR.price.toLocaleString('en-IN')}/day</strong>
                </div>

                <button onClick={(e) => { setShowLightbox(false); handleBookClick(e); }} className="btn btn-primary btn-full" style={{ borderRadius: '12px', padding: '14px 20px', fontSize: 14 }}>
                  Proceed to Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
