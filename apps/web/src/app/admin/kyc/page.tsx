'use client';
import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Search, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function AdminKycPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending');

  const load = async () => {
    const supabase = createClient();
    const query = supabase.from('kyc_records').select('*, profiles:user_id(full_name, email, phone)').order('submitted_at', { ascending: false });
    if (statusFilter === 'pending') query.eq('status', 'pending');
    const { data } = await query;
    if (data) setRecords(data);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleAction = async (id: string, action: 'verified' | 'rejected') => {
    const supabase = createClient();
    await supabase.from('kyc_records').update({
      status: action,
      verified_at: action === 'verified' ? new Date().toISOString() : null,
    }).eq('id', id);
    load();
  };

  const filtered = records.filter(r => {
    const name = r.profiles?.full_name?.toLowerCase() || '';
    const email = r.profiles?.email?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const pendingCount = records.filter(r => r.status === 'pending').length;

  return (
    <div>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>KYC Approval Queue</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review and verify host and guest identities</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="badge" style={{ background: '#fffbeb', color: '#d97706', padding: '6px 12px', fontSize: 14 }}>
            {pendingCount} Pending
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['pending', 'all'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', background: statusFilter === s ? 'var(--primary)' : 'white', color: statusFilter === s ? 'white' : 'var(--text-dark)', border: `1px solid ${statusFilter === s ? 'var(--primary)' : 'var(--border-light)'}` }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 14, outline: 'none' }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 64, height: 64, background: '#f0fdf4', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>All caught up!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>There are no {statusFilter === 'pending' ? 'pending ' : ''}KYC requests at the moment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(req => {
              const statusColor = req.status === 'verified' ? '#16a34a' : req.status === 'rejected' ? 'var(--accent)' : '#d97706';
              const statusBg = req.status === 'verified' ? '#f0fdf4' : req.status === 'rejected' ? '#fff1f2' : '#fffbeb';
              return (
                <div key={req.id} style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>
                        {(req.profiles?.full_name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{req.profiles?.full_name || 'Unknown'}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{req.profiles?.email} · {req.profiles?.phone}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ background: statusBg, color: statusColor, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{req.status}</span>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {new Date(req.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Documents summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                    {Object.entries(req.documents || {}).map(([key, val]) => (
                      <div key={key} style={{ padding: '10px 14px', background: val ? '#f0fdf4' : '#f8fafc', borderRadius: 8, border: `1px solid ${val ? '#bbf7d0' : 'var(--border-light)'}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>{key.replace('_', ' ')}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: val ? '#16a34a' : 'var(--text-secondary)' }}>{val ? '✓ Uploaded' : 'Missing'}</div>
                      </div>
                    ))}
                  </div>

                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                      <button onClick={() => handleAction(req.id, 'verified')} className="btn" style={{ background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}>
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button onClick={() => handleAction(req.id, 'rejected')} className="btn btn-outline" style={{ color: 'var(--accent)', borderColor: '#fda4af', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}>
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
