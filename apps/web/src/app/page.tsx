'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Shield, Star, Clock, ChevronRight, MapPin, Zap, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const FEATURED_CARS = [
  { id: '1', make: 'Hyundai', model: 'Creta', year: 2023, type: 'SUV', price: 2999, rating: 4.9, reviews: 47, city: 'Mumbai', host: 'Rahul S.', instant: true, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
  { id: '2', make: 'Tata', model: 'Nexon EV', year: 2023, type: 'Electric', price: 3499, rating: 4.8, reviews: 32, city: 'Bangalore', host: 'Priya M.', instant: true, img: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=800&q=80' },
  { id: '3', make: 'BMW', model: '3 Series', year: 2022, type: 'Luxury', price: 7999, rating: 5.0, reviews: 18, city: 'Delhi', host: 'Arjun K.', instant: false, img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80' },
  { id: '4', make: 'Maruti', model: 'Brezza', year: 2023, type: 'SUV', price: 1999, rating: 4.7, reviews: 63, city: 'Pune', host: 'Sneha R.', instant: true, img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80' },
  { id: '5', make: 'Honda', model: 'City', year: 2022, type: 'Sedan', price: 1799, rating: 4.8, reviews: 84, city: 'Hyderabad', host: 'Vikram P.', instant: true, img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80' },
  { id: '6', make: 'Kia', model: 'Seltos', year: 2023, type: 'SUV', price: 2799, rating: 4.9, reviews: 29, city: 'Chennai', host: 'Divya N.', instant: true, img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80' },
  { id: '7', make: 'MG', model: 'Hector', year: 2023, type: 'SUV', price: 3299, rating: 4.7, reviews: 41, city: 'Ahmedabad', host: 'Amit J.', instant: false, img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80' },
  { id: '8', make: 'Mahindra', model: 'XUV700', year: 2023, type: 'SUV', price: 3799, rating: 4.8, reviews: 22, city: 'Kolkata', host: 'Rohan B.', instant: true, img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80' },
];

const MAKES = [
  {
    name: 'Tesla',
    logo: (
      <svg viewBox="0 0 100 100" width="38" height="38" fill="#e82127">
        <path d="M50 15c-1.5 0-14.7 1.2-22.1 3.5-.8.2-.8 1.4 0 1.6 8.5 1.7 16.1 5.6 19.1 8 .3.3.5.7.3 1.1L37.1 55h25.8L52.7 29.2c-.2-.4 0-.8.3-1.1 3-2.4 10.6-6.3 19.1-8 .8-.2.8-1.4 0-1.6C64.7 16.2 51.5 15 50 15z" />
        <path d="M50 60c-.8 0-11.4 1.3-17.8 3.5-.8.3-.8 1.4 0 1.6 7.6 1.8 13.6 5.5 16.2 7.7.3.3.4.8.2 1.1L40 85h20l-8.6-11.1c-.2-.3-.1-.8.2-1.1 2.6-2.2 8.6-5.9 16.2-7.7.8-.2.8-1.3 0-1.6C61.4 61.3 50.8 60 50 60z" />
      </svg>
    ),
    value: 'tesla'
  },
  {
    name: 'BMW',
    logo: (
      <svg viewBox="0 0 100 100" width="38" height="38">
        <circle cx="50" cy="50" r="48" fill="#121212" />
        <circle cx="50" cy="50" r="36" fill="none" stroke="#ffffff" strokeWidth="2" />
        <path d="M50 50 L50 16 A34 34 0 0 1 84 50 Z" fill="#ffffff" />
        <path d="M50 50 L84 50 A34 34 0 0 1 50 84 Z" fill="#0066b2" />
        <path d="M50 50 L50 84 A34 34 0 0 1 16 50 Z" fill="#ffffff" />
        <path d="M50 50 L16 50 A34 34 0 0 1 50 16 Z" fill="#0066b2" />
        <circle cx="50" cy="50" r="47" fill="none" stroke="#ffffff" strokeWidth="1" />
      </svg>
    ),
    value: 'bmw'
  },
  {
    name: 'Porsche',
    logo: (
      <svg viewBox="0 0 100 100" width="38" height="38">
        <path d="M50 12 L80 25 L75 65 L50 88 L25 65 L20 25 Z" fill="#e2b007" stroke="#121212" strokeWidth="3" />
        <path d="M50 12 L50 88" stroke="#121212" strokeWidth="3" />
        <path d="M50 48 L80 25 M50 48 L20 25 M50 60 L75 65 M50 60 L25 65" stroke="#121212" strokeWidth="2" />
        <rect x="35" y="30" width="8" height="15" fill="#121212" />
        <rect x="57" y="30" width="8" height="15" fill="#121212" />
        <rect x="32" y="52" width="10" height="10" fill="#cc0000" />
        <rect x="58" y="52" width="10" height="10" fill="#cc0000" />
      </svg>
    ),
    value: 'porsche'
  },
  {
    name: 'Hyundai',
    logo: (
      <svg viewBox="0 0 100 100" width="38" height="38" fill="none" stroke="#002c5f" strokeWidth="5">
        <ellipse cx="50" cy="50" rx="42" ry="28" />
        <path d="M38 35 L42 65 M58 35 L62 65 M39 50 L61 50" stroke="#002c5f" strokeWidth="7" strokeLinecap="round" />
      </svg>
    ),
    value: 'hyundai'
  },
  {
    name: 'Maruti',
    logo: (
      <svg viewBox="0 0 100 100" width="34" height="34" fill="#005494">
        <path d="M20 20 H80 L50 50 H80 L60 80 H20 L50 50 Z" />
      </svg>
    ),
    value: 'maruti'
  },
  {
    name: 'Tata',
    logo: (
      <svg viewBox="0 0 100 100" width="38" height="38" fill="none" stroke="#005a9c" strokeWidth="5">
        <circle cx="50" cy="50" r="42" />
        <path d="M50 25 V75 M32 38 C32 38 42 32 50 32 C58 32 68 38 68 38" strokeWidth="7" strokeLinecap="round" />
      </svg>
    ),
    value: 'tata'
  },
  {
    name: 'Honda',
    logo: (
      <svg viewBox="0 0 100 100" width="36" height="36" fill="none" stroke="#121212" strokeWidth="5">
        <rect x="18" y="18" width="64" height="64" rx="12" />
        <path d="M34 30 V70 M66 30 V70 M34 50 H66" strokeWidth="7" strokeLinecap="round" />
      </svg>
    ),
    value: 'honda'
  },
  {
    name: 'Kia',
    logo: (
      <svg viewBox="0 0 100 100" width="40" height="40" fill="none" stroke="#000000" strokeWidth="8">
        <path d="M15 32 L30 68 M30 32 V68 M45 68 L58 32 L71 68 M76 32 V68 M68 50 H88" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    value: 'kia'
  },
];

const COLLECTIONS = [
  { title: 'Electric EV', desc: 'Go green with clean electric drives', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80', href: '/search?type=electric' },
  { title: 'Premium Luxury', desc: 'Uncompromising style and premium comfort', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80', href: '/search?type=luxury' },
  { title: 'Outdoor Adventure', desc: 'All-wheel drive SUVs ready for any terrain', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80', href: '/search?type=suv' },
  { title: 'Daily Commutes', desc: 'Comfortable, fuel-efficient daily sedans', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80', href: '/search?type=sedan' },
];

const TESTIMONIALS = [
  { name: 'Aisha T.', city: 'Mumbai', rating: 5, text: 'Found an amazing EV for my weekend trip to Lonavala. The host was super helpful and the car was immaculate. Will definitely use Flexi again!', avatar: 'A' },
  { name: 'Karan M.', city: 'Bangalore', rating: 5, text: 'Way better than traditional car rentals. No counters, no paperwork. Just picked up the keys and drove off. Incredible experience!', avatar: 'K' },
  { name: 'Priya S.', city: 'Delhi', rating: 5, text: 'As a host, I\'ve earned over ₹50,000 this month from my car sitting in the garage. Flexi made it so easy to list and manage my vehicle.', avatar: 'P' },
];

const TIME_OPTIONS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM',
  '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
];

const CALCULATOR_RATES: Record<string, number> = {
  sedan: 1800,
  suv: 2800,
  electric: 3500,
  luxury: 7200,
};

function CarCard({ car }: { car: any }) {
  return (
    <Link href={`/cars/${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', height: 200 }}>
          <img src={car.images?.[0] || car.img || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {(car.instant || car.instant_book) && (
            <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.95)', padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a' }}>
              <Zap size={14} fill="#16a34a" /> INSTANT BOOK
            </div>
          )}
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.95)', padding: '4px 8px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={14} color="#eab308" fill="#eab308" /> {car.rating || 'New'}
          </div>
        </div>
        <div className="car-card-body">
          <div className="car-card-title">{car.year} {car.make} {car.model}</div>
          <div className="car-card-location">
            <MapPin size={12} style={{ flexShrink: 0 }} />
            {car.city} · {car.reviews || 0} reviews
          </div>
          <div className="car-card-footer">
            <div className="car-card-price">₹{(car.price || 0).toLocaleString('en-IN')} <span>/day</span></div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [calcClass, setCalcClass] = useState('suv');
  const [calcDays, setCalcDays] = useState(15);
  const [activeCities, setActiveCities] = useState<{name: string}[]>([]);
  const [featuredCars, setFeaturedCars] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCities() {
      const supabase = createClient();
      const { data } = await supabase.from('cities').select('name').eq('is_active', true);
      if (data) setActiveCities(data);
    }
    fetchCities();
    
    async function fetchCars() {
      const supabase = createClient();
      const { data, error } = await supabase.from('vehicles').select('*').eq('status', 'active').limit(8);
      
      if (error) {
        console.error('Supabase fetch error:', error);
        return;
      }
      
      if (data) {
        setFeaturedCars(data);
      } else {
        setFeaturedCars([]);
      }
    }
    fetchCars();
  }, []);

  const estimatedEarnings = CALCULATOR_RATES[calcClass] * calcDays;
  const estimatedYearly = estimatedEarnings * 12;

  return (
    <>
      <style>{`
        .turo-hero-subtitle { text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        .search-widget-turo { background: #ffffff; border-radius: 999px; box-shadow: var(--shadow-lg); padding: 8px 12px 8px 24px; display: flex; align-items: center; gap: 16px; max-width: 960px; margin: 0 auto; }
        .search-divider { width: 1px; height: 36px; background: var(--border-light); }
        .search-field-turo { flex: 1; display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
        .search-field-turo label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dark); margin-bottom: 2px; }
        .search-field-turo input, .search-field-turo select { border: none; outline: none; font-size: 14px; font-weight: 500; color: var(--text-dark); background: transparent; width: 100%; }
        .search-btn-turo { width: 48px; height: 48px; border-radius: 50%; background: var(--primary); color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition); flex-shrink: 0; }
        .make-badge-container { display: flex; justify-content: space-between; gap: 16px; overflow-x: auto; padding: 10px 4px 20px; scrollbar-width: none; }
        .collection-card { border-radius: 16px; overflow: hidden; position: relative; aspect-ratio: 4/3; box-shadow: var(--shadow-sm); transition: var(--transition); }
        .calculator-card { background: #ffffff; border-radius: 24px; border: 1px solid var(--border-light); padding: 36px; box-shadow: var(--shadow-md); }
        .calculator-select { padding: 14px 18px; border-radius: 12px; border: 1.5px solid var(--border-light); font-size: 16px; font-weight: 600; outline: none; width: 100%; background: #ffffff; color: var(--text-dark); margin-top: 8px; cursor: pointer; }
        .calculator-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; background: var(--border-light); outline: none; margin-top: 16px; }
        .calculator-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--primary); cursor: pointer; }
      `}</style>

      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 className="h1" style={{ color: 'white', marginBottom: 12, fontWeight: 900, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Find your drive.</h1>
            <p className="turo-hero-subtitle" style={{ fontSize: 20, color: '#f8fafc', fontWeight: 500, margin: '0 auto', maxWidth: 600 }}>Skip the rental counter. Explore the local collection of fine vehicles.</p>
          </div>

          <div className="search-widget-turo">
            <div className="search-field-turo">
              <label>Where</label>
              <select id="hero-location">
                {activeCities.length > 0 ? activeCities.map(city => <option key={city.name} value={city.name}>{city.name}</option>) : <option value="">Loading locations...</option>}
              </select>
            </div>
            <div className="search-divider" />
            <div className="search-field-turo">
              <label>From</label>
              <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="search-divider" />
            <div className="search-field-turo">
              <label>To</label>
              <input type="date" defaultValue={new Date(Date.now() + 86400000*3).toISOString().split('T')[0]} />
            </div>
            <Link href="/search" className="search-btn-turo"><Search size={20} /></Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 0 40px', background: 'white' }}>
        <div className="container">
          <div style={{ marginBottom: 24 }}><h2 style={{ fontSize: 24, fontWeight: 800 }}>Browse by make</h2></div>
          <div className="make-badge-container">
            {MAKES.map(make => (
              <Link key={make.value} href={`/search?make=${make.value}`} className="make-badge-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text-dark)', flexShrink: 0 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff', border: '1.5px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{make.logo}</div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{make.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 0 64px', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ marginBottom: 28 }}><h2 style={{ fontSize: 24, fontWeight: 800 }}>Browse by collection</h2></div>
          <div className="grid-4">
            {COLLECTIONS.map((c, i) => (
              <Link href={c.href} key={i} className="collection-card">
                <img src={c.img} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: 'white' }}>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{c.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>{c.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h2 className="h2" style={{ fontWeight: 800, marginBottom: 8 }}>Popular cars near you</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Top-rated cars listed by local hosts</p>
            </div>
            <Link href="/search" className="btn btn-outline btn-sm">View all <ChevronRight size={16} /></Link>
          </div>
          <div className="grid-4">
            {featuredCars.map(car => <CarCard key={car.id} car={car} />)}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#f4f4f4' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <span style={{ display: 'inline-block', color: 'var(--primary)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                Become a Host
              </span>
              <h2 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-dark)', lineHeight: 1.2, marginBottom: 20 }}>
                Let your car work for you
              </h2>
              <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
                List your vehicle on Flexi and turn a liability into an asset. You set the pricing, establish your schedule, and control the availability. We handle payment processing, support, and protection logs.
              </p>
              
              <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>₹25,000+</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Avg. monthly revenue</div>
                </div>
                <div style={{ width: 1, background: 'var(--border-light)' }} />
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>24/7</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Host support cover</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
                <Link href="/become-a-host" className="btn btn-primary" style={{ padding: '14px 28px' }}>Start earning today</Link>
                <Link href="/how-it-works#host" className="btn btn-ghost" style={{ padding: '14px 28px', border: '1.5px solid var(--border-light)' }}>See how it works</Link>
              </div>
            </div>

            {/* Interactive Calculator Box */}
            <div className="calculator-card">
              <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 24 }}>
                Calculate your potential earnings
              </h3>
              
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Select vehicle class</label>
                <select className="calculator-select" value={calcClass} onChange={e => setCalcClass(e.target.value)}>
                  <option value="sedan">Sedan (City, Dzire, Verna)</option>
                  <option value="suv">SUV (Creta, Nexon, Brezza)</option>
                  <option value="electric">Electric EV (Nexon EV, ZS EV)</option>
                  <option value="luxury">Luxury Premium (BMW 3 Series, Audi A4)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <label style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Days rented per month</label>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{calcDays} days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={calcDays}
                  onChange={e => setCalcDays(Number(e.target.value))}
                  className="calculator-slider"
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Est. monthly earnings</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-dark)', marginTop: 4 }}>
                    ₹{estimatedEarnings.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Est. yearly earnings</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                    ₹{estimatedYearly.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS (Turo clean style) ========== */}
      <section className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="h2" style={{ fontWeight: 800, color: 'var(--text-dark)', marginBottom: 8 }}>How Flexi works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 17 }}>Simple, convenient, and built for modern adventures</p>
          </div>
          <div className="grid-3">
            {[
              { step: '1', title: 'Find the perfect car', desc: 'Browse from thousands of locally-owned vehicles. Filter by car type, price, fuel, and location.' },
              { step: '2', title: 'Book in minutes', desc: 'Verify your ID (KYC) securely, select your preferred protection plan, and checkout using Razorpay.' },
              { step: '3', title: 'Pick up & drive', desc: 'Coordinate handover details with your local host. Grab the keys, start the engine, and hit the road!' }
            ].map((step, i) => (
              <div key={i} style={{ padding: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
                  {step.step}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 12 }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS (Turo Style) ========== */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="h2" style={{ fontWeight: 800, color: 'var(--text-dark)' }}>What our community says</h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ padding: 28, borderRadius: 16, background: '#ffffff', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', marginBottom: 16 }}>
                  {[...Array(t.rating)].map((_, j) => <span key={j} style={{ color: '#f5a623', fontSize: 16 }}>★</span>)}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-dark)', marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TRUST SIGNALS (Turo Style) ========== */}
      <section className="section-sm" style={{ background: '#ffffff', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
            {[
              { icon: <Shield size={28} color="var(--primary)" />, title: 'Verified cars', desc: 'Every vehicle is verified and approved by admins before listing' },
              { icon: <Star size={28} color="#f5a623" />, title: 'Trusted hosts', desc: 'Host profile background checks and actual guest reviews' },
              { icon: <Clock size={28} color="#16a34a" />, title: '24/7 support', desc: 'Round-the-clock roadside assistance and passenger support' },
              { icon: <Zap size={28} color="#7c3aed" />, title: 'Instant bookings', desc: 'Book and confirm your trip immediately with hosts' },
            ].map(({ icon, title, desc }) => (
              <div key={title}>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{icon}</div>
                <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 16, color: 'var(--text-dark)' }}>{title}</h4>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
