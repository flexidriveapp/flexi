'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Search, Plus, X, MapPin, CheckCircle, XCircle } from 'lucide-react';

type AdminCity = { id: string; name: string; image_url: string; is_active: boolean };

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<AdminCity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCityId, setEditingCityId] = useState<string | null>(null);

  // New City Form State
  const [newCity, setNewCity] = useState({ name: '', image: '' });

  const loadCities = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('cities').select('*').order('created_at', { ascending: false });
    if (data) setCities(data);
  };

  useEffect(() => {
    loadCities();
  }, []);

  const handleToggle = async (cityId: string, isActive: boolean) => {
    const supabase = createClient();
    await supabase.from('cities').update({ is_active: !isActive }).eq('id', cityId);
    loadCities();
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    
    if (editingCityId) {
      await supabase.from('cities').update({ name: newCity.name, image_url: newCity.image }).eq('id', editingCityId);
    } else {
      await supabase.from('cities').insert({ name: newCity.name, image_url: newCity.image, is_active: true });
    }
    
    setIsModalOpen(false);
    setNewCity({ name: '', image: '' });
    setEditingCityId(null);
    loadCities();
  };

  const openEditModal = (city: AdminCity) => {
    setEditingCityId(city.id);
    setNewCity({ name: city.name, image: city.image_url });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingCityId(null);
    setNewCity({ name: '', image: '' });
    setIsModalOpen(true);
  };

  const filtered = cities.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>City Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage the locations where Flexi operates</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={openAddModal} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} /> Add City
          </button>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>{cities.filter(c => c.is_active).length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Active Hubs</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search cities..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 14, outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: '#f8fafc' }}>
                {['City Image', 'City Name', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '16px', minWidth: 120 }}>
                    <img src={c.image_url} alt={c.name} style={{ width: 80, height: 50, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-light)' }} />
                  </td>
                  <td style={{ padding: '16px', minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 15, color: 'var(--text-dark)' }}>
                      <MapPin size={16} color="var(--primary)" /> {c.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>ID: {c.id.slice(0, 8)}...</div>
                  </td>
                  <td style={{ padding: '16px', minWidth: 140 }}>
                    <span style={{ 
                      background: c.is_active ? '#f0fdf4' : '#f8fafc', 
                      color: c.is_active ? '#16a34a' : '#64748b', 
                      padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 
                    }}>
                      {c.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', minWidth: 200 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => openEditModal(c)} 
                        style={{ 
                          padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600,
                          background: '#eff6ff',
                          color: 'var(--primary)',
                          border: '1px solid #bfdbfe'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggle(c.id, c.is_active)} 
                        style={{ 
                          padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600,
                          background: c.is_active ? '#fff1f2' : '#f0fdf4',
                          color: c.is_active ? 'var(--accent)' : '#16a34a',
                          border: `1px solid ${c.is_active ? '#fecdd3' : '#bbf7d0'}`
                        }}
                      >
                        {c.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No cities found matching your search.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>{editingCityId ? 'Edit City' : 'Add New City'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCity} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>City Name</label>
                <input required value={newCity.name} onChange={e => setNewCity({...newCity, name: e.target.value})} type="text" placeholder="e.g. Chennai, TN" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 8 }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Cover Image URL</label>
                <input required value={newCity.image} onChange={e => setNewCity({...newCity, image: e.target.value})} type="url" placeholder="https://images.unsplash.com/photo-..." style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 8 }} />
                {newCity.image && (
                  <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', height: 120, border: '1px solid var(--border-light)' }}>
                    <img src={newCity.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn" style={{ flex: 1 }}>{editingCityId ? 'Save Changes' : 'Add City'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
