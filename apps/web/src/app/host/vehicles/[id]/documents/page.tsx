'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, CheckCircle, Clock } from 'lucide-react';
import { getHostVehicles, addVehicleDocument, type HostVehicle } from '@/lib/hostStore';

export default function VehicleDocumentsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [vehicle, setVehicle] = useState<HostVehicle | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    const v = getHostVehicles().find(v => v.id === id);
    if (v) setVehicle(v);
    else router.push('/host/vehicles');
  }, [id, router]);

  const handleUpload = (type: 'RC' | 'Insurance' | 'PUC') => {
    setUploading(type);
    setTimeout(() => {
      addVehicleDocument(id, { type, url: `mock_${type.toLowerCase()}.pdf`, verified: false });
      setVehicle(getHostVehicles().find(v => v.id === id) || null);
      setUploading(null);
    }, 1500);
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
        <p style={{ color: 'var(--text-secondary)' }}>Manage legal documents for {vehicle.make} {vehicle.model} ({vehicle.id})</p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {DOC_TYPES.map(type => {
          const doc = vehicle.documents.find(d => d.type === type);
          return (
            <div key={type} className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{type === 'RC' ? 'Registration Certificate (RC)' : type === 'PUC' ? 'Pollution Certificate (PUC)' : type}</h3>
                  {doc ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: doc.verified ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                      {doc.verified ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {doc.verified ? 'Verified by Admin' : 'Pending Verification'}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Missing Document</div>
                  )}
                </div>
              </div>
              
              <div>
                <button 
                  onClick={() => handleUpload(type)}
                  disabled={uploading === type || (doc && doc.verified)}
                  className="btn" 
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: doc?.verified ? '#f8fafc' : 'white', border: '1px solid var(--border-light)', color: doc?.verified ? 'var(--text-secondary)' : 'var(--text-dark)' }}
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
