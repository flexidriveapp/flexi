'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, SlidersHorizontal, Star, Zap, ChevronDown, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';


const VEHICLE_TYPES = ['All', 'SUV', 'Sedan', 'Electric', 'Luxury', 'Van', 'Sports'];
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    minPrice: 0, maxPrice: 20000,
    minRating: 0, instantBook: false,
    sort: 'recommended',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [liveCars, setLiveCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCars() {
      const supabase = createClient();
      const { data, error } = await supabase.from('vehicles').select('*').eq('status', 'active');
      if (error) {
        console.error('Supabase fetch error:', error);
        return;
      }
      if (data) setLiveCars(data);
      setLoading(false);
    }
    loadCars();
  }, []);

  const filtered = liveCars.filter(car => {
    if (filters.type !== 'all' && car.type !== filters.type) return false;
    if (car.price < filters.minPrice || car.price > filters.maxPrice) return false;
    if (car.rating && car.rating < filters.minRating) return false;
    if (filters.instantBook && !car.instant_book && !car.instant) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sort === 'price_asc') return a.price - b.price;
    if (filters.sort === 'price_desc') return b.price - a.price;
    if (filters.sort === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Search Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border-light)', padding: '16px 24px', position: 'sticky', top: 72, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', borderRadius: 10, padding: '8px 14px', border: '1.5px solid var(--border-light)', flex: 1, minWidth: 180 }}>
            <MapPin size={16} color="var(--primary)" />
            <input style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, width: '100%' }} defaultValue={searchParams.get('location') || ''} placeholder="Location" />
          </div>
          <input type="date" defaultValue={searchParams.get('start') || ''} style={{ border: '1.5px solid var(--border-light)', borderRadius: 10, padding: '8px 14px', fontSize: 14, outline: 'none', color: 'var(--text-dark)' }} />
          <input type="date" defaultValue={searchParams.get('end') || ''} style={{ border: '1.5px solid var(--border-light)', borderRadius: 10, padding: '8px 14px', fontSize: 14, outline: 'none', color: 'var(--text-dark)' }} />
          <button className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>Search</button>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline" style={{ padding: '9px 16px', fontSize: 14, gap: 6 }}>
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>
      </div>

      {/* Type Pills */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border-light)', padding: '12px 24px', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'nowrap' }}>
          {VEHICLE_TYPES.map(t => (
            <button key={t} onClick={() => setFilters(f => ({ ...f, type: t.toLowerCase() }))}
              style={{ padding: '7px 16px', borderRadius: 999, border: '1.5px solid', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', borderColor: filters.type === t.toLowerCase() ? 'var(--primary)' : 'var(--border-light)', background: filters.type === t.toLowerCase() ? 'var(--primary)' : 'white', color: filters.type === t.toLowerCase() ? 'white' : 'var(--text-dark)' }}>
              {t}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
              style={{ border: '1.5px solid var(--border-light)', borderRadius: 10, padding: '7px 14px', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: showFilters ? '280px 1fr' : '1fr', gap: 24, transition: 'all 0.3s' }}>
        {/* Filters Sidebar */}
        {showFilters && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border-light)', padding: 24, height: 'fit-content', position: 'sticky', top: 160 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>Filters</h3>
              <button onClick={() => setFilters(f => ({ ...f, minPrice: 0, maxPrice: 20000, minRating: 0, instantBook: false }))} style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>Reset all</button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Price per day</h4>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Min</label>
                  <input type="number" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: Number(e.target.value) }))} className="input" style={{ padding: '8px 12px', fontSize: 14 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Max</label>
                  <input type="number" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))} className="input" style={{ padding: '8px 12px', fontSize: 14 }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Minimum rating</h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[0, 4.0, 4.5, 4.8].map(r => (
                  <button key={r} onClick={() => setFilters(f => ({ ...f, minRating: r }))}
                    style={{ padding: '6px 12px', borderRadius: 999, border: '1.5px solid', fontSize: 13, cursor: 'pointer', borderColor: filters.minRating === r ? 'var(--primary)' : 'var(--border-light)', background: filters.minRating === r ? 'var(--primary)' : 'white', color: filters.minRating === r ? 'white' : 'var(--text-dark)' }}>
                    {r === 0 ? 'Any' : `${r}+ ★`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                <input type="checkbox" checked={filters.instantBook} onChange={e => setFilters(f => ({ ...f, instantBook: e.target.checked }))} style={{ width: 16, height: 16 }} />
                <Zap size={15} color="var(--primary)" /> Instant Book only
              </label>
            </div>
          </div>
        )}

        {/* Results */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}>
              {loading ? 'Loading...' : <><span style={{ color: 'var(--primary)' }}>{filtered.length}</span> cars available</>}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filtered.map(car => (
              <Link key={car.id} href={`/cars/${car.id}`} className="car-card" style={{ textDecoration: 'none' }}>
                <div className="car-card-image" style={{ position: 'relative', overflow: 'hidden', height: 200 }}>
                  <img src={car.images?.[0] || car.img || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={14} color="#eab308" fill="#eab308" /> {car.rating || 'New'}
                  </div>
                  {(car.instant || car.instant_book) && <span className="car-card-badge">⚡ Instant</span>}
                </div>
                <div className="car-card-body">
                  <div className="car-card-title">{car.year} {car.make} {car.model}</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 999 }}>{car.seats} seats</span>
                    <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 999 }}>{car.fuel}</span>
                    <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 999 }}>{car.transmission}</span>
                  </div>
                  <div className="car-card-location"><MapPin size={12} />{car.city} · {car.reviews} reviews</div>
                  <div className="car-card-footer">
                    <div className="car-card-price">₹{car.price.toLocaleString('en-IN')} <span>/day</span></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No cars found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or check back later for new listings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
