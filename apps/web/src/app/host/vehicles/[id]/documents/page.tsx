'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface VehicleDoc {
  id: string;
  type: string;
  url: string;
  is_verified: boolean;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
}

export default function VehicleDocumentsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [documents, setDocuments] = useState<VehicleDoc[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: v } = await supabase.from('vehicles').select('id, make, model').eq('id', id).single();
      if (!v) { router.push('/host/vehicles'); return; }
      setVehicle(v);

      const { data: docs } = await supabase.from('vehicle_documents').select('*').eq('vehicle_id', id);
      setDocuments(docs || []);
    }
    load();
  }, [id, router]);

  const handleUpload = async (type: 'RC' | 'Insurance' | 'PUC') => {
    setUploading(type);
    const supabase = createClient();

    // Check if doc already exists for this type
    const existing = documents.find(d => d.type === type);
    if (existing) {
      await supabase.from('vehicle_documents').update({ url: `${type.toLowerCase()}_uploaded.pdf`, is_verified: false }).eq('id', existing.id);
    } else {
      await supabase.from('vehicle_documents').insert({ vehicle_id: id, type, url: `${type.toLowerCase()}_uploaded.pdf`, is_verified: false });
    }

    const { data: docs } = await supabase.from('vehicle_documents').select('*').eq('vehicle_id', id);
    setDocuments(docs || []);
    setUploading(null);
  };

  if (!vehicle) return null;

  const DOC_TYPES: ('RC' | 'Insurance' | 'PUC')[] = ['RC', 'Insurance', 'PUC'];

  return (
    <div style={{ maxWidth: 800 }}>
      <Link href="/host/vehicles" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 24, textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Vehicles
      </Link>
      
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Vehicle Documents</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage legal documents for {vehicle.make} {vehicle.model}</p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {DOC_TYPES.map(type => {
          const doc = documents.find(d => d.type === type);
          return (
            <div key={type} className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{type === 'RC' ? 'Registration Certificate (RC)' : type === 'PUC' ? 'Pollution Certificate (PUC)' : type}</h3>
                  {doc ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: doc.is_verified ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                      {doc.is_verified ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {doc.is_verified ? 'Verified by Admin' : 'Pending Verification'}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Missing Document</div>
                  )}
                </div>
              </div>
              
              <div>
                <button 
                  onClick={() => handleUpload(type)}
                  disabled={uploading === type || (doc?.is_verified ?? false)}
                  className="btn" 
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: doc?.is_verified ? '#f8fafc' : 'white', border: '1px solid var(--border-light)', color: doc?.is_verified ? 'var(--text-secondary)' : 'var(--text-dark)' }}
                >
                  <Upload size={16} /> {uploading === type ? 'Uploading...' : doc ? 'Update File' : 'Upload'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
