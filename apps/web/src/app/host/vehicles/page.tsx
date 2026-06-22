'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Plus, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function HostVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);

  const loadVehicles = async () => {
    const supabase = createClient();
    const userStr = localStorage.getItem('flexi_user');
    const hostId = userStr ? JSON.parse(userStr).id : '22222222-2222-2222-2222-222222222222';
    
    const { data, error } = await supabase.from('vehicles').select('*, vehicle_documents(*)').eq('host_id', hostId);
    
    if (data) {
      const formatted = data.map(v => ({
        ...v,
        tripsCompleted: 0, 
        earnings: 0,
        documents: v.vehicle_documents || [],
        isAvailable: v.is_available,
        img: v.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80'
      }));
      setVehicles(formatted);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleToggle = async (id: string, isAvailable: boolean) => {
    const supabase = createClient();
    await supabase.from('vehicles').update({ is_available: !isAvailable }).eq('id', id);
    loadVehicles();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>My Vehicles</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your fleet availability and documents</p>
        </div>
        <Link href="/host/vehicles/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} /> List New Car
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {vehicles.map(v => (
          <div key={v.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative' }}>
              <img src={v.img} alt={v.model} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 12, right: 12, background: v.isAvailable ? '#16a34a' : '#64748b', color: 'white', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                {v.isAvailable ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {v.isAvailable ? 'Available' : 'Unavailable'}
              </div>
            </div>
            
            <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{v.make} {v.model}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>ID: {v.id}</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, padding: '12px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: 15 }}>{v.tripsCompleted}</div>
                  Trips
                </div>
                <div style={{ width: 1, background: 'var(--border-light)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>₹{(v.earnings / 1000).toFixed(0)}k</div>
                  Earned
                </div>
                <div style={{ width: 1, background: 'var(--border-light)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: 15 }}>{v.documents.length}/3</div>
                  Docs
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
                <button 
                  onClick={() => handleToggle(v.id, v.isAvailable)}
                  className={`btn ${v.isAvailable ? 'btn-outline' : ''}`} 
                  style={{ flex: 1, padding: '8px 0', background: v.isAvailable ? 'white' : '#f0fdf4', color: v.isAvailable ? 'var(--text-secondary)' : '#16a34a', borderColor: v.isAvailable ? 'var(--border-light)' : '#bbf7d0' }}
                >
                  {v.isAvailable ? 'Mark Unavailable' : 'Make Available'}
                </button>
                <Link href={`/host/vehicles/${v.id}/documents`} className="btn" style={{ flex: 1, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#f8fafc', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                  <FileText size={16} /> Documents
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {vehicles.length === 0 && (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>You haven't listed any vehicles yet.</p>
          <Link href="/host/vehicles/new" className="btn btn-primary">List Your First Car</Link>
        </div>
      )}
    </div>
  );
}
