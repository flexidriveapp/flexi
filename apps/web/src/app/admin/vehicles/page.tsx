'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, MapPin, Plus, X, Edit } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  approved: { label: 'Approved', color: '#16a34a', bg: '#f0fdf4' },
  pending: { label: 'Pending Review', color: '#d97706', bg: '#fffbeb' },
  rejected: { label: 'Rejected', color: 'var(--accent)', bg: '#fff1f2' },
};

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // Categories from DB
  const [dbCategories, setDbCategories] = useState<{ makes: string[], models: string[], fuels: string[], transmissions: string[], types: string[] }>({ makes: [], models: [], fuels: [], transmissions: [], types: [] });

  const [newVehicle, setNewVehicle] = useState({
    make: '', model: '', fuelType: '', transmission: '', carType: '', host: '', hostEmail: '', city: '', price: 2000, description: '', status: 'pending'
  });

  const loadVehicles = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('vehicles')
      .select('*, profiles:host_id(full_name, email)')
      .order('created_at', { ascending: false });
    
    if (data) {
      const formatted = data.map(v => ({
        ...v,
        host: v.profiles?.full_name || 'Unknown',
        hostEmail: v.profiles?.email || 'Unknown'
      }));
      setVehicles(formatted);
    }
  };

  useEffect(() => {
    loadVehicles();
    async function loadCats() {
      const supabase = createClient();
      const { data } = await supabase.from('vehicle_categories').select('*').eq('is_active', true);
      if (data) {
        setDbCategories({
          makes: data.filter(c => c.type === 'make').map(c => c.value),
          models: data.filter(c => c.type === 'model').map(c => c.value),
          fuels: data.filter(c => c.type === 'fuel').map(c => c.value),
          transmissions: data.filter(c => c.type === 'transmission').map(c => c.value),
          types: data.filter(c => c.type === 'body_type').map(c => c.value),
        });
      }
    }
    loadCats();
  }, []);

  const handleAction = async (vehicleId: string, action: 'approved' | 'rejected') => {
    const supabase = createClient();
    const { error } = await supabase
      .from('vehicles')
      .update({ status: action === 'approved' ? 'active' : 'rejected' })
      .eq('id', vehicleId);
      
    if (!error) loadVehicles();
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    
    if (editingVehicleId) {
      await supabase.from('vehicles').update({
        make: newVehicle.make,
        model: newVehicle.model,
        type: newVehicle.carType,
        fuel: newVehicle.fuelType,
        transmission: newVehicle.transmission,
        city: newVehicle.city,
        price: newVehicle.price,
        description: newVehicle.description,
        status: newVehicle.status
      }).eq('id', editingVehicleId);
    } else {
      const userStr = localStorage.getItem('flexi_user');
      const hostId = userStr ? JSON.parse(userStr).id : '22222222-2222-2222-2222-222222222222';
      
      await supabase.from('vehicles').insert({
        host_id: hostId,
        make: newVehicle.make,
        model: newVehicle.model,
        type: newVehicle.carType,
        fuel: newVehicle.fuelType,
        transmission: newVehicle.transmission,
        city: newVehicle.city,
        status: newVehicle.status,
        price: newVehicle.price,
        description: newVehicle.description,
        seats: 5,
        year: new Date().getFullYear(),
        images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80']
      });
    }

    setIsModalOpen(false);
    setEditingVehicleId(null);
    setNewVehicle({ make: '', model: '', fuelType: '', transmission: '', carType: '', host: '', hostEmail: '', city: '', price: 2000, description: '', status: 'pending' });
    loadVehicles();
  };

  const openEditModal = (v: any) => {
    setEditingVehicleId(v.id);
    setNewVehicle({
      make: v.make, model: v.model, fuelType: v.fuel, transmission: v.transmission, carType: v.type, host: v.host, hostEmail: v.hostEmail, city: v.city, price: v.price, description: v.description || '', status: v.status
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingVehicleId(null);
    setNewVehicle({ make: '', model: '', fuelType: '', transmission: '', carType: '', host: '', hostEmail: '', city: '', price: 2000, description: '', status: 'active' });
    setIsModalOpen(true);
  };

  const filtered = vehicles.filter(v => {
    const matchesSearch = v.make?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.host?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Vehicle Listings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review and manage all host vehicle submissions</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button 
            onClick={openAddModal}
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={18} /> Add Vehicle
          </button>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{vehicles.filter(v => v.status === 'active').length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Active</div>
          </div>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#d97706' }}>{vehicles.filter(v => v.status === 'pending').length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Pending</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by make, model, or host..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 14, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['all', 'pending', 'active', 'rejected'] as const).map(status => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{ 
                  padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                  background: statusFilter === status ? 'var(--primary)' : 'white',
                  color: statusFilter === status ? 'white' : 'var(--text-dark)',
                  border: `1px solid ${statusFilter === status ? 'var(--primary)' : 'var(--border-light)'}`
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: '#f8fafc' }}>
                {['Vehicle', 'Location', 'Host', 'Submitted', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const st = STATUS_MAP[v.status] || STATUS_MAP.pending;
                return (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '16px', minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fdf4ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>🚗</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-dark)' }}>{v.make} {v.model}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ID: {v.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, minWidth: 140 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} /> {v.city}
                      </div>
                    </td>
                    <td style={{ padding: '16px', minWidth: 160 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{v.host}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.hostEmail}</div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, minWidth: 140 }}>
                      {new Date(v.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px', minWidth: 140 }}>
                      <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px', minWidth: 180 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEditModal(v)} style={{ padding: '6px 12px', background: '#eff6ff', color: 'var(--primary)', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>View / Edit</button>
                        {v.status === 'pending' && (
                          <>
                            <button onClick={() => handleAction(v.id, 'approved')} style={{ padding: '6px 12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Approve</button>
                            <button onClick={() => handleAction(v.id, 'rejected')} style={{ padding: '6px 12px', background: '#fff1f2', color: 'var(--accent)', border: '1px solid #fecdd3', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Reject</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No vehicles found matching your filters.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>{editingVehicleId ? 'Review & Edit Vehicle' : 'Add New Vehicle'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Make</label>
                  <select required value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 8, background: 'white' }}>
                    <option value="">Select</option>
                    {dbCategories.makes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Model</label>
                  <select required value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 8, background: 'white' }}>
                    <option value="">Select</option>
                    {dbCategories.models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Fuel Type</label>
                  <select required value={newVehicle.fuelType} onChange={e => setNewVehicle({...newVehicle, fuelType: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 8, background: 'white' }}>
                    <option value="">Select</option>
                    {dbCategories.fuels.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Transmission</label>
                  <select required value={newVehicle.transmission} onChange={e => setNewVehicle({...newVehicle, transmission: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 8, background: 'white' }}>
                    <option value="">Select</option>
                    {dbCategories.transmissions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Car Type</label>
                  <select required value={newVehicle.carType} onChange={e => setNewVehicle({...newVehicle, carType: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 8, background: 'white' }}>
                    <option value="">Select</option>
                    {dbCategories.types.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>


              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>City</label>
                  <input required value={newVehicle.city} onChange={e => setNewVehicle({...newVehicle, city: e.target.value})} type="text" placeholder="e.g. Bangalore" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Daily Price (₹)</label>
                  <input required value={newVehicle.price} onChange={e => setNewVehicle({...newVehicle, price: Number(e.target.value)})} type="number" placeholder="2000" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 8 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Description</label>
                <textarea value={newVehicle.description} onChange={e => setNewVehicle({...newVehicle, description: e.target.value})} placeholder="Vehicle details..." style={{ width: '100%', height: 80, padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 8, resize: 'vertical' }} />
              </div>

              {editingVehicleId && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Status</label>
                  <select value={newVehicle.status} onChange={e => setNewVehicle({...newVehicle, status: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 8, background: 'white' }}>
                    <option value="pending">Pending</option>
                    <option value="active">Active (Approved)</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn" style={{ flex: 1 }}>{editingVehicleId ? 'Save Changes' : 'Save Vehicle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
