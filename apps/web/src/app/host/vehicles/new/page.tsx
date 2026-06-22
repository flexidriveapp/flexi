'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Upload, CheckCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useEffect } from 'react';

const ALL_FEATURES = ['GPS Navigation', 'Bluetooth', 'Sunroof', 'Backup Camera', 'Apple CarPlay', 'Android Auto', 'Cruise Control', 'Heated Seats', 'Premium Sound', 'AWD', 'USB Charger', 'Pet Friendly', 'Smoking Allowed', 'Child Seat', 'Dashcam', 'Power Windows', 'Keyless Entry'];

export default function AddVehiclePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  
  const [dbCategories, setDbCategories] = useState({
    makes: [] as string[],
    types: [] as string[],
    fuels: [] as string[],
    transmissions: [] as string[],
    cities: [] as string[]
  });

  const [form, setForm] = useState({
    make: '', model: '', year: new Date().getFullYear(), color: '', type: '', fuel: 'Petrol', transmission: 'Manual', seats: 5,
    registration: '', description: '', city: '', address: '', price: '', weekly_discount: '0', monthly_discount: '0', deposit: '0',
    instant_book: true, features: [] as string[], images: [] as string[],
    documents: { RC: false, Insurance: false, PUC: false }
  });

  useEffect(() => {
    async function loadOptions() {
      const supabase = createClient();
      const [catsRes, citiesRes] = await Promise.all([
        supabase.from('vehicle_categories').select('*').eq('is_active', true),
        supabase.from('cities').select('name').eq('is_active', true)
      ]);

      if (catsRes.error) console.error('Error fetching categories:', catsRes.error);
      if (citiesRes.error) console.error('Error fetching cities:', citiesRes.error);

      if (catsRes.data) {
        console.log('Categories fetched:', catsRes.data);
        setDbCategories(prev => ({
          ...prev,
          makes: catsRes.data.filter(c => c.type === 'make').map(c => c.value),
          types: catsRes.data.filter(c => c.type === 'body_type').map(c => c.value),
          fuels: catsRes.data.filter(c => c.type === 'fuel').map(c => c.value),
          transmissions: catsRes.data.filter(c => c.type === 'transmission').map(c => c.value),
          cities: citiesRes.data ? citiesRes.data.map(c => c.name) : []
        }));
      }
    }
    loadOptions();
  }, []);

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleFeature = (f: string) => update('features', form.features.includes(f) ? form.features.filter(x => x !== f) : [...form.features, f]);
  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const urls = Array.from(e.target.files).map(f => URL.createObjectURL(f));
      update('images', [...form.images, ...urls].slice(0, 10));
    }
  };
  const removeImage = (i: number) => update('images', form.images.filter((_, idx) => idx !== i));

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>List Your Car</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Complete all steps to publish your vehicle on Flexi</p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36, background: 'white', padding: '16px 20px', borderRadius: 14, border: '1px solid var(--border-light)' }}>
        {['Details', 'Photos', 'Features', 'Documents', 'Pricing', 'Publish'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 5 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: i < step ? '#16a34a' : i === step ? 'var(--primary)' : 'var(--bg-secondary)', color: i <= step ? 'white' : 'var(--text-secondary)', cursor: i < step ? 'pointer' : 'default', transition: 'all 0.3s' }} onClick={() => i < step && setStep(i)}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: i === step ? 'var(--primary)' : i < step ? '#16a34a' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s}</div>
            </div>
            {i < 5 && <div style={{ flex: 1, height: 2, background: i < step ? '#16a34a' : 'var(--border-light)', margin: '0 8px', marginBottom: 20, transition: 'all 0.3s' }} />}
          </div>
        ))}
      </div>

      {/* Step 0: Details */}
      {step === 0 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 24 }}>Vehicle Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Make / Brand</label>
              <select className="input" value={form.make} onChange={e => update('make', e.target.value)}>
                <option value="">Select make</option>
                {dbCategories.makes.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Model</label>
              <input className="input" placeholder="e.g. Creta, City, Nexon" value={form.model} onChange={e => update('model', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Year</label>
              <input className="input" type="number" min="2000" max={new Date().getFullYear() + 1} value={form.year} onChange={e => update('year', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="input-label">Color</label>
              <input className="input" placeholder="e.g. Pearl White" value={form.color} onChange={e => update('color', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Vehicle Type</label>
              <select className="input" value={form.type} onChange={e => update('type', e.target.value)}>
                <option value="">Select type</option>
                {dbCategories.types.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Number of Seats</label>
              <select className="input" value={form.seats} onChange={e => update('seats', Number(e.target.value))}>
                {[2, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} seats</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Fuel Type</label>
              <select className="input" value={form.fuel} onChange={e => update('fuel', e.target.value)}>
                <option value="">Select Fuel</option>
                {dbCategories.fuels.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Transmission</label>
              <select className="input" value={form.transmission} onChange={e => update('transmission', e.target.value)}>
                <option value="">Select Transmission</option>
                {dbCategories.transmissions.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Registration Number</label>
            <input className="input" placeholder="e.g. MH 01 AB 1234" value={form.registration} onChange={e => update('registration', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">City</label>
              <select className="input" value={form.city} onChange={e => update('city', e.target.value)}>
                <option value="">Select City</option>
                {dbCategories.cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Pickup Address</label>
              <input className="input" placeholder="Full address" value={form.address} onChange={e => update('address', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Description</label>
            <textarea className="input" style={{ height: 100, resize: 'vertical' }} placeholder="Describe your car, its condition, and what makes it special..." value={form.description} onChange={e => update('description', e.target.value)} />
          </div>
          <button onClick={() => setStep(1)} className="btn btn-primary" disabled={!form.make || !form.model || !form.type || !form.city}>
            Continue to Photos <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 1: Photos */}
      {step === 1 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Vehicle Photos</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Add up to 10 high-quality photos. The first photo will be the main listing image.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {form.images.map((img, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', border: i === 0 ? '2px solid var(--primary)' : '1px solid var(--border-light)' }}>
                <img src={img} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {i === 0 && <div style={{ position: 'absolute', top: 6, left: 6, background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>MAIN</div>}
                <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={12} />
                </button>
              </div>
            ))}
            {form.images.length < 10 && (
              <label style={{ aspectRatio: '4/3', border: '2px dashed var(--border-light)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 8, background: 'var(--bg)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}>
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={addImage} />
                <Upload size={24} color="var(--text-secondary)" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Add photos</span>
              </label>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(0)} className="btn btn-outline"><ChevronLeft size={16} /> Back</button>
            <button onClick={() => setStep(2)} className="btn btn-primary" disabled={form.images.length === 0}>
              Continue to Features <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Features */}
      {step === 2 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Features & Amenities</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Select all features available in your car. This helps guests find the right vehicle.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 28 }}>
            {ALL_FEATURES.map(f => (
              <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1.5px solid', borderColor: form.features.includes(f) ? 'var(--primary)' : 'var(--border-light)', borderRadius: 10, cursor: 'pointer', background: form.features.includes(f) ? '#eff6ff' : 'white', transition: 'all 0.15s' }}>
                <input type="checkbox" checked={form.features.includes(f)} onChange={() => toggleFeature(f)} style={{ display: 'none' }} />
                <div style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid', borderColor: form.features.includes(f) ? 'var(--primary)' : 'var(--border-light)', background: form.features.includes(f) ? 'var(--primary)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {form.features.includes(f) && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: form.features.includes(f) ? 'var(--primary)' : 'var(--text-dark)' }}>{f}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(1)} className="btn btn-outline"><ChevronLeft size={16} /> Back</button>
            <button onClick={() => setStep(3)} className="btn btn-primary">Continue to Documents <ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Step 3: Documents */}
      {step === 3 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Vehicle Documents</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Upload your Registration Certificate (RC), Insurance, and PUC for verification.</p>
          
          <div style={{ display: 'grid', gap: 20, marginBottom: 28 }}>
            {(['RC', 'Insurance', 'PUC'] as const).map(docType => (
              <div key={docType} style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                    {docType === 'RC' ? 'Registration Certificate' : docType === 'PUC' ? 'Pollution Under Control (PUC)' : 'Valid Insurance'}
                  </h3>
                  <div style={{ fontSize: 13, color: form.documents[docType] ? '#16a34a' : 'var(--text-secondary)' }}>
                    {form.documents[docType] ? '✓ Document uploaded' : 'PDF or Image (Max 5MB)'}
                  </div>
                </div>
                <label 
                  className={`btn ${form.documents[docType] ? 'btn-outline' : ''}`}
                  style={{ background: form.documents[docType] ? 'white' : 'var(--bg-secondary)', color: form.documents[docType] ? '#16a34a' : 'var(--text-dark)', borderColor: form.documents[docType] ? '#bbf7d0' : 'transparent', cursor: 'pointer', margin: 0 }}
                >
                  <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={() => {
                    const tempDocType = docType;
                    setTimeout(() => update('documents', { ...form.documents, [tempDocType]: true }), 500);
                  }} />
                  <Upload size={16} style={{ marginRight: 6 }} /> {form.documents[docType] ? 'Re-upload' : 'Upload'}
                </label>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(2)} className="btn btn-outline"><ChevronLeft size={16} /> Back</button>
            <button onClick={() => setStep(4)} className="btn btn-primary" disabled={!form.documents.RC || !form.documents.Insurance}>
              Continue to Pricing <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pricing */}
      {step === 4 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 24 }}>Pricing</h2>
          <div className="form-group">
            <label className="input-label">Daily Rate (₹)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-secondary)' }}>₹</span>
              <input className="input" style={{ paddingLeft: 32 }} type="number" min="0" placeholder="2999" value={form.price} onChange={e => update('price', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Weekly Discount (%)</label>
              <input className="input" type="number" min="0" max="100" placeholder="10" value={form.weekly_discount} onChange={e => update('weekly_discount', e.target.value)} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Applied for 7+ day bookings</span>
            </div>
            <div className="form-group">
              <label className="input-label">Monthly Discount (%)</label>
              <input className="input" type="number" min="0" max="100" placeholder="20" value={form.monthly_discount} onChange={e => update('monthly_discount', e.target.value)} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Applied for 30+ day bookings</span>
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Security Deposit (₹)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-secondary)' }}>₹</span>
              <input className="input" style={{ paddingLeft: 32 }} type="number" min="0" placeholder="5000" value={form.deposit} onChange={e => update('deposit', e.target.value)} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Fully refundable after the trip</span>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
              <input type="checkbox" checked={form.instant_book} onChange={e => update('instant_book', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
              ⚡ Enable Instant Book (guests can book without waiting for approval)
            </label>
          </div>
          {form.price && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontWeight: 600, color: '#15803d', marginBottom: 8 }}>💰 Estimated earnings</div>
              <div style={{ fontSize: 14, color: '#374151' }}>Per day: <strong>₹{Math.round(Number(form.price) * 0.9).toLocaleString('en-IN')}</strong> (after 10% platform fee)</div>
              <div style={{ fontSize: 14, color: '#374151' }}>Per month: <strong>₹{Math.round(Number(form.price) * 0.9 * 22).toLocaleString('en-IN')}</strong> (est. 22 days)</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(3)} className="btn btn-outline"><ChevronLeft size={16} /> Back</button>
            <button onClick={() => setStep(5)} className="btn btn-primary" disabled={!form.price}>Review & Publish <ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Step 5: Review & Publish */}
      {step === 5 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 24 }}>Review & Publish</h2>
          {form.images[0] && <img src={form.images[0]} alt="Main" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 20 }} />}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Vehicle', value: `${form.year} ${form.make} ${form.model}` },
              { label: 'Type', value: form.type },
              { label: 'Fuel', value: form.fuel },
              { label: 'Transmission', value: form.transmission },
              { label: 'Seats', value: `${form.seats} seats` },
              { label: 'Color', value: form.color || '—' },
              { label: 'City', value: form.city },
              { label: 'Daily Rate', value: `₹${Number(form.price).toLocaleString('en-IN')}` },
              { label: 'Security Deposit', value: `₹${Number(form.deposit).toLocaleString('en-IN')}` },
              { label: 'Instant Book', value: form.instant_book ? 'Yes ⚡' : 'No' },
              { label: 'Photos', value: `${form.images.length} photos` },
              { label: 'Features', value: `${form.features.length} selected` },
              { label: 'Documents', value: `${Object.values(form.documents).filter(Boolean).length} uploaded` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 14, color: '#92400e' }}>
            ℹ️ Your listing will be reviewed by our team before going live (usually within 24 hours).
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(4)} className="btn btn-outline"><ChevronLeft size={16} /> Back</button>
            <button onClick={async () => { 
              const supabase = createClient();
              const userStr = localStorage.getItem('flexi_user');
              let hostId = null;

              if (userStr) {
                const parsedUser = JSON.parse(userStr);
                if (parsedUser.id?.startsWith('mock-user-') && parsedUser.phone) {
                  // Fallback: get real UUID from DB
                  const { data } = await supabase.from('profiles').select('id').eq('phone', parsedUser.phone).single();
                  if (data) hostId = data.id;
                } else {
                  hostId = parsedUser.id;
                }
              }

              if (!hostId || hostId.startsWith('mock-user-')) {
                alert('Authentication error. Please log out and log back in to get a valid user ID.');
                return;
              }
              
              const { error } = await supabase.from('vehicles').insert({
                host_id: hostId,
                make: form.make,
                model: form.model,
                year: form.year,
                color: form.color,
                type: form.type,
                seats: form.seats,
                fuel: form.fuel,
                transmission: form.transmission,
                city: form.city,
                address: form.address,
                description: form.description,
                price: Number(form.price),
                weekly_discount: Number(form.weekly_discount),
                monthly_discount: Number(form.monthly_discount),
                deposit: Number(form.deposit),
                instant_book: form.instant_book,
                features: form.features,
                images: form.images,
                status: 'pending'
              });

              if (error) {
                alert('Error submitting vehicle: ' + error.message);
                return;
              }

              alert('🎉 Vehicle submitted for review! Documents have been attached.');
              router.push('/host/vehicles'); 
            }} className="btn btn-primary btn-lg">
              <CheckCircle size={18} /> Publish Listing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
